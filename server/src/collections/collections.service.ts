import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { CreateCollectionDto } from './dto/create-collection.dto'
import { UpdateCollectionDto } from './dto/update-collection.dto'

@Injectable()
export class CollectionsService {
    private readonly prisma = new PrismaClient()

    findAll() {
        return this.prisma.collection.findMany({
            orderBy: { createdAt: 'desc' },
        })
    }

    async findOne(id: string) {
        const collection = await this.prisma.collection.findUnique({
            where: { id },
        })
        if (!collection) throw new NotFoundException('Collection not found')
        return collection
    }

    create(data: CreateCollectionDto) {
        return this.prisma.collection.create({ data })
    }

    async update(id: string, data: UpdateCollectionDto) {
        await this.findOne(id)
        return this.prisma.collection.update({ where: { id }, data })
    }

    async remove(id: string) {
        await this.findOne(id)
        return this.prisma.collection.delete({ where: { id } })
    }
}
