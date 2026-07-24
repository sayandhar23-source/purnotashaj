import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VariantDto } from './variant.dto';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'A product can have at most 5 images.' })
  images?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsNumber()
  basePrice: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;

  @IsOptional()
  @IsBoolean()
  isHotDeal?: boolean;

  @IsOptional()
  @IsBoolean()
  showOnSalePage?: boolean;

  @IsOptional()
  @IsBoolean()
  saleEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsDateString()
  saleStartsAt?: string;

  @IsOptional()
  @IsDateString()
  saleEndsAt?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
