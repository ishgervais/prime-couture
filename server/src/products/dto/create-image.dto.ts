import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsBoolean } from 'class-validator';

export class CreateImageDto {
  @IsOptional()
  @IsString()
  imageUrl?: string;

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
