import { IsOptional, IsString } from 'class-validator'

export class CreatePageviewDto {
    @IsString()
    path!: string

    @IsOptional()
    @IsString()
    referrer?: string

    @IsOptional()
    @IsString()
    userAgent?: string
}
