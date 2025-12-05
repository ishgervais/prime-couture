import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, OrderStatus, PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  private readonly prisma = new PrismaClient();

  async create(dto: CreateOrderDto) {
    const product = await this.resolveProduct(dto);
    const priceAmount = new Prisma.Decimal(product.priceAmount);
    const order = await this.prisma.order.create({
      data: {
        productId: product.id,
        quantity: dto.quantity,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerWhatsapp: dto.customerWhatsapp,
        customerEmail: dto.customerEmail,
        customerNote: dto.customerNote,
        priceAmount,
        priceCurrency: product.priceCurrency,
      },
      include: { product: true },
    });

    return { ...order, whatsappLink: this.buildWhatsappLink(order, product) };
  }

  list(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { product: true } });
    if (!order) throw new NotFoundException('Order not found');
    return { ...order, whatsappLink: this.buildWhatsappLink(order, order.product) };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findOne(id);
    return this.prisma.order.update({ where: { id }, data: { status: dto.status } });
  }

  private async resolveProduct(dto: CreateOrderDto) {
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException('Product not found');
      return product;
    }
    if (dto.productSlug) {
      const product = await this.prisma.product.findUnique({ where: { slug: dto.productSlug } });
      if (!product) throw new NotFoundException('Product not found');
      return product;
    }
    throw new NotFoundException('Missing product reference');
  }

  private buildWhatsappLink(order: any, product: any) {
    const number = process.env.WHATSAPP_ORDER_NUMBER || '';
    const lines = [
      `New order for Prime Couture`,
      `Product: ${product.title}`,
      `Qty: ${order.quantity}`,
      `Price: ${order.priceAmount} ${order.priceCurrency}`,
      `Customer: ${order.customerName}`,
      `Phone: ${order.customerPhone}`,
      order.customerEmail ? `Email: ${order.customerEmail}` : '',
      order.customerNote ? `Note: ${order.customerNote}` : '',
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${number.replace(/[^0-9+]/g, '')}?text=${text}`;
  }
}
