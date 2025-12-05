import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  productSlug?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  customerName!: string;

  @IsString()
  customerPhone!: string;

  @IsString()
  customerWhatsapp!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerNote?: string;
}
