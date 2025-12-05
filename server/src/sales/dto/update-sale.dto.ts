import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SaleStatus } from '@prisma/client';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;
}
