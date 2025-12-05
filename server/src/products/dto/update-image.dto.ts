import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateImageDto {
  @IsOptional()
  @IsString()
  fileId?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;
}
