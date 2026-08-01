import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderPaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class VerifyRazorpayDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}
