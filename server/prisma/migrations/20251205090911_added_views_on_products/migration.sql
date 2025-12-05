-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;
