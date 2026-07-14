import { IsArray, IsIn, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  product: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  variantName?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  image?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  totalAmount: number;

  @IsIn(['stripe', 'razorpay'])
  paymentProvider: 'stripe' | 'razorpay';

  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, string>;
}
