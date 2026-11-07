import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Trim } from '../../common/utils/transforms';

class OrderItemDto {
  @IsMongoId()
  product: string;

  @IsOptional()
  @IsMongoId()
  variantId?: string;

  // title / variantName / image are accepted for backwards-compatibility with
  // the storefront but IGNORED — the server uses the database's values.
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  variantName?: string;

  // Only used to detect "this price went up since you added it" — never to decide the charge
  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  image?: string;
}

// Required and validated. The form used to allow a completely blank address,
// which would have left an order that couldn't be shipped.
class ShippingAddressDto {
  @Trim()
  @IsString()
  @MinLength(2, { message: 'Please enter your full name.' })
  @MaxLength(80)
  fullName: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/[\s-]/g, '') : value))
  @Matches(/^(\+?91)?[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit mobile number.' })
  phone: string;

  @Trim()
  @IsString()
  @MinLength(5, { message: 'Please enter your full address.' })
  @MaxLength(200)
  line1: string;

  @Trim()
  @IsString()
  @MinLength(2, { message: 'Please enter your city.' })
  @MaxLength(60)
  city: string;

  @Trim()
  @IsString()
  @MinLength(2, { message: 'Please enter your state.' })
  @MaxLength(60)
  state: string;

  @Trim()
  @Matches(/^[1-9][0-9]{5}$/, { message: 'Please enter a valid 6-digit PIN code.' })
  pincode: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // Accepted but ignored: the total is always recomputed on the server.
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsIn(['stripe', 'razorpay'])
  paymentProvider: 'stripe' | 'razorpay';

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  referralCode?: string;
}
