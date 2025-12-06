import { IsArray, IsOptional, IsString } from 'class-validator'

export class ImportExpensesDto {
    @IsArray()
    rows!: Array<Record<string, unknown>>

    @IsOptional()
    @IsString()
    defaultCurrency?: string
}
