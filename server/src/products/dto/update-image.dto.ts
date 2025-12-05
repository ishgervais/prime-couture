import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateImageDto {
  @IsOptional()
  @IsString()
  fileId?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;
}
