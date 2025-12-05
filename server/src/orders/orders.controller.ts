import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderStatus } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @ApiBody({
    type: CreateOrderDto,
    examples: {
      default: {
        summary: 'Create order',
        value: {
          productId: 'product-uuid',
          quantity: 1,
          customerName: 'Jane Doe',
          customerPhone: '+250700000000',
          customerWhatsapp: '+250700000000',
          customerEmail: 'jane@example.com',
          customerNote: 'Please deliver in Kigali',
        },
      },
    },
  })
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Query('status') status?: OrderStatus) {
    return this.service.list(status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateOrderStatusDto,
    examples: { default: { summary: 'Update status', value: { status: 'CONTACTED', internalNote: 'Called customer' } } },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}
