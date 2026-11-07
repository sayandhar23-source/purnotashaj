import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOrderPaymentDto {
  @IsMongoId()
  orderId: string;
}

export class VerifyRazorpayDto {
  @IsMongoId()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  razorpayOrderId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  razorpayPaymentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  razorpaySignature: string;
}
