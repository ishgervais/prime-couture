import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency, PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(Currency)
  currency!: Currency;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsDateString()
  paidAt!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
