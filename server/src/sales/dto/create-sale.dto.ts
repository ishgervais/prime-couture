import { Type } from 'class-transformer'
import {
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator'
import { Currency, PaymentMethod } from '@prisma/client'

export class CreateSaleDto {
    @IsOptional()
    @IsString()
    clientId?: string

    // Inline client creation
    @IsOptional()
    @IsString()
    clientName?: string

    @IsOptional()
    @IsString()
    clientPhone?: string

    @IsOptional()
    @IsString()
    clientEmail?: string

    @IsString()
    productId!: string

    @IsDateString()
    saleDate!: string

    @IsOptional()
    @IsDateString()
    pickupDate?: string

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    quantity!: number

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    unitPrice!: number

    @IsEnum(Currency)
    currency!: Currency

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    productionCost?: number

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    prePaymentAmount!: number

    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod

    @IsOptional()
    @IsString()
    notes?: string
}
