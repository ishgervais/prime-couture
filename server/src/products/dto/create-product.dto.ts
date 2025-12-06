import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    MinLength,
} from 'class-validator'
import { Currency } from '@prisma/client'

export class CreateProductDto {
    @IsString()
    @MinLength(2)
    title!: string

    @IsOptional()
    @IsString()
    slug?: string

    @IsString()
    description!: string

    @IsNumber()
    @Min(0)
    priceAmount!: number

    @IsEnum(Currency)
    priceCurrency!: Currency

    @IsString()
    collectionId!: string

    @IsString()
    categoryId!: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true
}
