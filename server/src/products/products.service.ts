import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common'
import { Prisma, Currency, PrismaClient } from '@prisma/client'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { CreateImageDto } from './dto/create-image.dto'
import { UpdateImageDto } from './dto/update-image.dto'

interface ProductFilters {
    collectionSlug?: string
    categorySlug?: string
    search?: string
    isActive?: boolean
    currency?: Currency
}

@Injectable()
export class ProductsService {
    private readonly prisma = new PrismaClient()

    private buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
        const where: Prisma.ProductWhereInput = {}
        if (filters.collectionSlug) {
            where.collection = { slug: filters.collectionSlug }
        }
        if (filters.categorySlug) {
            where.category = { slug: filters.categorySlug }
        }
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                {
                    description: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
            ]
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive
        }
        if (filters.currency) {
            where.priceCurrency = filters.currency
        }
        return where
    }

    findAll(filters: ProductFilters = {}) {
        return this.prisma.product.findMany({
            where: this.buildWhere(filters),
            orderBy: { createdAt: 'desc' },
            include: {
                images: {
                    orderBy: { position: 'asc' },
                    include: { file: true },
                },
                collection: true,
                category: true,
            },
        })
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.update({
            where: { slug },
            data: { viewCount: { increment: 1 } },
            include: {
                images: {
                    orderBy: { position: 'asc' },
                    include: { file: true },
                },
                collection: true,
                category: true,
            },
        })
        if (!product) throw new NotFoundException('Product not found')
        return product
    }

    async create(data: CreateProductDto) {
        const baseSlug = (data.slug || data.title || 'product')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')

        const slug = await this.ensureUniqueSlug(baseSlug)

        return this.prisma.product.create({
            data: {
                ...data,
                slug,
                priceAmount: new Prisma.Decimal(data.priceAmount),
            },
        })
    }

    async update(id: string, data: UpdateProductDto) {
        await this.ensureExists(id)
        return this.prisma.product.update({
            where: { id },
            data: {
                ...data,
                priceAmount: data.priceAmount
                    ? new Prisma.Decimal(data.priceAmount)
                    : undefined,
            },
        })
    }

    async remove(id: string) {
        await this.ensureExists(id)
        return this.prisma.product.delete({ where: { id } })
    }

    async addImages(productId: string, images: CreateImageDto[]) {
        await this.ensureExists(productId)
        const createData = await Promise.all(
            images.map(async (img, index) => {
                const fileId = await this.resolveFile(img)
                return {
                    productId,
                    fileId,
                    altText: img.altText,
                    isVisible: img.isVisible ?? true,
                    position: img.position ?? index,
                }
            })
        )

        return this.prisma.productImage.createMany({ data: createData })
    }

    async updateImage(productId: string, imageId: string, dto: UpdateImageDto) {
        const image = await this.prisma.productImage.findFirst({
            where: { id: imageId, productId },
        })
        if (!image) throw new NotFoundException('Image not found')
        let data: Prisma.ProductImageUpdateInput = {
            altText: dto.altText,
            position: dto.position,
            isVisible: dto.isVisible,
        }
        if (dto.fileId) {
            data = { ...data, file: { connect: { id: dto.fileId } } }
        }
        return this.prisma.productImage.update({ where: { id: imageId }, data })
    }

    async removeImage(productId: string, imageId: string) {
        const image = await this.prisma.productImage.findFirst({
            where: { id: imageId, productId },
        })
        if (!image) throw new NotFoundException('Image not found')
        return this.prisma.productImage.delete({ where: { id: imageId } })
    }

    private async ensureExists(id: string) {
        const found = await this.prisma.product.findUnique({ where: { id } })
        if (!found) throw new NotFoundException('Product not found')
        return found
    }

    private async resolveFile(img: CreateImageDto): Promise<string> {
        if (img.fileId) return img.fileId
        if (!img.imageUrl)
            throw new BadRequestException('imageUrl or fileId is required')
        const file = await this.prisma.file.create({
            data: { url: img.imageUrl },
        })
        return file.id
    }

    private async ensureUniqueSlug(slug: string): Promise<string> {
        let candidate = slug
        let counter = 1
        // Try slug, then slug-1, slug-2, ... until free
        while (true) {
            const exists = await this.prisma.product.findUnique({
                where: { slug: candidate },
            })
            if (!exists) return candidate
            candidate = `${slug}-${counter}`
            counter += 1
        }
    }
}
