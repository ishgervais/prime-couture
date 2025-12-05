import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  private readonly prisma = new PrismaClient();

  async create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }

  async findAll(search?: string) {
    const where =
      search && search.trim().length
        ? ({
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          } as any)
        : undefined;

    const [clients, aggregates] = await Promise.all([
      this.prisma.client.findMany({ where, orderBy: { createdAt: 'desc' } }),
      this.prisma.sale.groupBy({
        by: ['clientId'],
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
    ]);

    const aggMap = new Map(
      aggregates.map((a) => [
        a.clientId,
        { totalSalesAmount: Number(a._sum.totalAmount ?? 0), salesCount: a._count._all },
      ]),
    );

    return clients.map((c) => ({
      ...c,
      totalSalesAmount: aggMap.get(c.id)?.totalSalesAmount ?? 0,
      salesCount: aggMap.get(c.id)?.salesCount ?? 0,
    }));
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        sales: {
          include: { product: true },
          orderBy: { saleDate: 'desc' },
        },
      },
    });
    if (!client) throw new NotFoundException('Client not found');

    const totalSales = client.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const outstanding = client.sales.reduce((sum, s) => sum + Number(s.remainingAmount), 0);

    const { sales, ...rest } = client;
    return { ...rest, sales, totalSales, outstanding };
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.ensureExists(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  private async ensureExists(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }
}
