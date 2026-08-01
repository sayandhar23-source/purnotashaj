import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(500)
  message: string;

  @IsIn(['price_drop', 'new_deal', 'general'])
  type: 'price_drop' | 'new_deal' | 'general';

  // Providing one of these auto-fills the image (from the product/category)
  // and sets the link — admin doesn't have to fill both image and link
  // separately for the common case of "this is about product X".
  @IsOptional()
  @IsString()
  productSlug?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  // Only used when neither productSlug nor categorySlug is given — lets
  // admin still attach an image to a general announcement.
  @IsOptional()
  @IsString()
  customImage?: string;

  @IsOptional()
  @IsIn(['product', 'category', 'sale', 'none'])
  linkType?: 'product' | 'category' | 'sale' | 'none';
}
