import { IsArray, IsOptional, IsString } from 'class-validator'

export class ImportExpensesDto {
  @IsArray()
  rows!: Array<Record<string, any>>

  @IsOptional()
  @IsString()
  defaultCurrency?: string
}
