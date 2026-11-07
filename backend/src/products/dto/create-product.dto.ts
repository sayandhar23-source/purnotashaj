import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VariantDto } from './variant.dto';
import { ImageMetaDto } from './image-meta.dto';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageMetaDto)
  imageMeta?: ImageMetaDto[];

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

  // Products admin wants shown as "Complete the look" on this product's page
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6, { message: 'Pick at most 6 recommended products.' })
  @IsMongoId({ each: true })
  recommendedProducts?: string[];

  @IsOptional()
  @IsBoolean()
  trackStock?: boolean;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
