import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoriesService {
    private readonly prisma = new PrismaClient()

    findAll() {
        return this.prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        })
        if (!category) throw new NotFoundException('Category not found')
        return category
    }

    create(data: CreateCategoryDto) {
        return this.prisma.category.create({ data })
    }

    async update(id: string, data: UpdateCategoryDto) {
        await this.findOne(id)
        return this.prisma.category.update({ where: { id }, data })
    }

    async remove(id: string) {
        await this.findOne(id)
        return this.prisma.category.delete({ where: { id } })
    }
}
