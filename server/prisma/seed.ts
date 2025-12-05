import dotenv from 'dotenv';
import { PrismaClient, Role, Currency } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || typeof databaseUrl !== 'string')
  throw new Error('DATABASE_URL environment variable is not set or invalid');

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl },
  },
});

async function main() {
  const adminEmail = 'admin@primecouture.rw';
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Prime Admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const collection = await prisma.collection.upsert({
    where: { slug: 'prime-suits' },
    update: {},
    create: {
      name: 'Prime Suits',
      slug: 'prime-suits',
      description: 'Signature tailored suits.',
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'suits' },
    update: {},
    create: {
      name: 'Suits',
      slug: 'suits',
      description: 'Mens and womens luxury suits',
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: 'classic-black-tuxedo' },
    update: {},
    create: {
      title: 'Classic Black Tuxedo',
      slug: 'classic-black-tuxedo',
      description: 'A timeless black tuxedo tailored in Kigali.',
      priceAmount: 280000,
      priceCurrency: Currency.RWF,
      isActive: true,
      collectionId: collection.id,
      categoryId: category.id,
    },
  });

  const file = await prisma.file.upsert({
    where: { id: product.id },
    update: {},
    create: {
      id: product.id,
      url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    },
  });

  await prisma.productImage.upsert({
    where: { id: product.id },
    update: {},
    create: {
      id: product.id,
      productId: product.id,
      fileId: file.id,
      altText: 'Black tuxedo',
      position: 0,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
