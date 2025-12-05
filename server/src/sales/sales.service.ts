import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  Currency,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  PrismaClient,
  SaleStatus,
} from '@prisma/client';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateClientDto } from '../clients/dto/create-client.dto';

@Injectable()
export class SalesService {
  private readonly prisma = new PrismaClient();

  private calcPaymentStatus(totalPaid: number, totalAmount: number): PaymentStatus {
    if (totalPaid <= 0) return PaymentStatus.NONE;
    if (totalPaid >= totalAmount) return PaymentStatus.FULL;
    return PaymentStatus.PARTIAL;
  }

  private toDecimal(n: number | string | Prisma.Decimal) {
    return new Prisma.Decimal(n);
  }

  private async ensureClient(dto: CreateSaleDto): Promise<string> {
    if (dto.clientId) return dto.clientId;
    if (!dto.clientName || !dto.clientPhone) {
      throw new BadRequestException('Provide clientId or clientName + clientPhone');
    }
    const newClient: CreateClientDto = {
      fullName: dto.clientName,
      phone: dto.clientPhone,
      email: dto.clientEmail,
    };
    const client = await this.prisma.client.create({ data: newClient });
    return client.id;
  }

  async create(dto: CreateSaleDto) {
    const clientId = await this.ensureClient(dto);
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new BadRequestException('Product not found');

    const quantity = Number(dto.quantity);
    const unitPrice = Number(dto.unitPrice);
    const productionCost = dto.productionCost ? Number(dto.productionCost) : 0;
    const prePayment = Number(dto.prePaymentAmount);
    const totalAmount = quantity * unitPrice;
    const totalPaid = prePayment;
    const remainingAmount = totalAmount - totalPaid;
    const profit = totalAmount - productionCost;
    const paymentStatus = this.calcPaymentStatus(totalPaid, totalAmount);

    const sale = await this.prisma.sale.create({
      data: {
        clientId,
        productId: dto.productId,
        saleDate: new Date(dto.saleDate),
        pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
        quantity,
        unitPrice: this.toDecimal(unitPrice),
        currency: dto.currency,
        totalAmount: this.toDecimal(totalAmount),
        prePaymentAmount: this.toDecimal(prePayment),
        totalPaid: this.toDecimal(totalPaid),
        remainingAmount: this.toDecimal(Math.max(remainingAmount, 0)),
        productionCost: dto.productionCost ? this.toDecimal(productionCost) : null,
        profit: this.toDecimal(profit),
        paymentStatus,
        paymentMethod: dto.paymentMethod,
        status: SaleStatus.ACTIVE,
        notes: dto.notes,
      },
      include: {
        client: true,
        product: true,
        payments: true,
      },
    });

    if (prePayment > 0) {
      await this.prisma.payment.create({
        data: {
          saleId: sale.id,
          amount: this.toDecimal(prePayment),
          currency: dto.currency,
          paymentMethod: dto.paymentMethod,
          paidAt: new Date(dto.saleDate),
          note: 'Pre-payment',
        },
      });
    }

    return sale;
  }

  async findAll(params: {
    from?: string;
    to?: string;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    clientId?: string;
    productId?: string;
    categoryId?: string;
  }) {
    const where: Prisma.SaleWhereInput = {};
    if (params.from || params.to) {
      where.saleDate = {};
      if (params.from) where.saleDate.gte = new Date(params.from);
      if (params.to) where.saleDate.lte = new Date(params.to);
    }
    if (params.paymentStatus) where.paymentStatus = params.paymentStatus;
    if (params.paymentMethod) where.paymentMethod = params.paymentMethod;
    if (params.clientId) where.clientId = params.clientId;
    if (params.productId) where.productId = params.productId;
    if (params.categoryId) where.product = { categoryId: params.categoryId };

    return this.prisma.sale.findMany({
      where,
      orderBy: { saleDate: 'desc' },
      include: {
        client: true,
        product: { include: { category: true } },
        payments: true,
      },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        product: true,
        payments: true,
      },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async update(id: string, dto: UpdateSaleDto) {
    const sale = await this.findOne(id);
    const quantity = dto.quantity ?? sale.quantity;
    const unitPrice = dto.unitPrice ?? Number(sale.unitPrice);
    const productionCost = dto.productionCost ?? Number(sale.productionCost ?? 0);
    const totalAmount = quantity * Number(unitPrice);

    // totalPaid remains from existing payments
    const payments = await this.prisma.payment.findMany({ where: { saleId: id } });
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = totalAmount - totalPaid;
    const profit = totalAmount - productionCost;
    const paymentStatus = this.calcPaymentStatus(totalPaid, totalAmount);

    return this.prisma.sale.update({
      where: { id },
      data: {
        saleDate: dto.saleDate ? new Date(dto.saleDate) : sale.saleDate,
        pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : sale.pickupDate,
        quantity,
        unitPrice: this.toDecimal(unitPrice),
        currency: dto.currency ?? sale.currency,
        totalAmount: this.toDecimal(totalAmount),
        productionCost: dto.productionCost ? this.toDecimal(productionCost) : sale.productionCost,
        profit: this.toDecimal(profit),
        totalPaid: this.toDecimal(totalPaid),
        remainingAmount: this.toDecimal(Math.max(remaining, 0)),
        paymentStatus,
        paymentMethod: dto.paymentMethod ?? sale.paymentMethod,
        status: dto.status ?? sale.status,
        notes: dto.notes ?? sale.notes,
      },
    });
  }

  async addPayment(saleId: string, dto: CreatePaymentDto) {
    await this.findOne(saleId);
    await this.prisma.payment.create({
      data: {
        saleId,
        amount: this.toDecimal(dto.amount),
        currency: dto.currency,
        paymentMethod: dto.paymentMethod,
        paidAt: new Date(dto.paidAt),
        note: dto.note,
      },
    });
    return this.recalculate(saleId);
  }

  private async recalculate(saleId: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) throw new NotFoundException('Sale not found');
    const payments = await this.prisma.payment.findMany({ where: { saleId } });
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalAmount = Number(sale.totalAmount);
    const productionCost = Number(sale.productionCost ?? 0);
    const remaining = totalAmount - totalPaid;
    const profit = totalAmount - productionCost;
    const paymentStatus = this.calcPaymentStatus(totalPaid, totalAmount);

    return this.prisma.sale.update({
      where: { id: saleId },
      data: {
        totalPaid: this.toDecimal(totalPaid),
        remainingAmount: this.toDecimal(Math.max(remaining, 0)),
        profit: this.toDecimal(profit),
        paymentStatus,
      },
      include: {
        client: true,
        product: true,
        payments: true,
      },
    });
  }

  async statsSummary() {
    const sales = await this.prisma.sale.findMany();
    const totalSalesAmount = sales.reduce((s, v) => s + Number(v.totalAmount), 0);
    const totalPaidAmount = sales.reduce((s, v) => s + Number(v.totalPaid), 0);
    const totalOutstandingAmount = sales.reduce((s, v) => s + Number(v.remainingAmount), 0);
    const totalProfit = sales.reduce((s, v) => s + Number(v.profit), 0);

    // Simple timeseries: last 30 days
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const timeseriesRaw = await this.prisma.sale.groupBy({
      by: ['saleDate'],
      where: { saleDate: { gte: from } },
      _sum: { totalAmount: true },
    });
    const timeseries = timeseriesRaw.map((r) => ({
      date: r.saleDate.toISOString().slice(0, 10),
      total: Number(r._sum.totalAmount ?? 0),
    }));

    return {
      totalSalesAmount,
      totalPaidAmount,
      totalOutstandingAmount,
      totalProfit,
      timeseries,
    };
  }

  async monthlyStats(year?: string) {
    const sales = await this.prisma.sale.findMany({
      orderBy: { saleDate: 'asc' },
    });

    const availableYears = Array.from(
      new Set(sales.map((s) => new Date(s.saleDate).getFullYear().toString())),
    ).sort();

    const targetYear = year && year !== 'all' ? Number(year) : null;
    const filtered = targetYear
      ? sales.filter((s) => new Date(s.saleDate).getFullYear() === targetYear)
      : sales;

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
      paid: 0,
      profit: 0,
    }));

    filtered.forEach((s) => {
      const m = new Date(s.saleDate).getMonth(); // 0-based
      months[m].total += Number(s.totalAmount ?? 0);
      months[m].paid += Number(s.totalPaid ?? 0);
      months[m].profit += Number(s.profit ?? 0);
    });

    return {
      year: targetYear ?? 'all',
      availableYears,
      months,
    };
  }
}
