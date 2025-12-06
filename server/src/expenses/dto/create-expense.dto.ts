import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { Currency } from '@prisma/client'

export class CreateExpenseDto {
  @IsDateString()
  expenseDate!: string

  @IsString()
  @IsNotEmpty()
  title!: string

  @IsNumber()
  amount!: number

  @IsEnum(Currency)
  currency: Currency = Currency.RWF

  @IsUUID()
  categoryId!: string

  @IsOptional()
  @IsString()
  notes?: string
}
