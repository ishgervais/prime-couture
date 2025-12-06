import { IsOptional, IsString } from 'class-validator'

export class CreateClientDto {
    @IsString()
    fullName!: string

    @IsOptional()
    @IsString()
    phone?: string

    @IsOptional()
    @IsString()
    email?: string

    @IsOptional()
    @IsString()
    whatsapp?: string

    @IsOptional()
    @IsString()
    address?: string

    @IsOptional()
    @IsString()
    notes?: string
}
