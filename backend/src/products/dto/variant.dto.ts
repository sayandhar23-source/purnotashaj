import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class VariantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
