import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateOrderPaymentDto, VerifyRazorpayDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('stripe/checkout-session')
  createStripeSession(@Body() dto: CreateOrderPaymentDto) {
    return this.paymentsService.createStripeCheckoutSession(dto.orderId);
  }

  // Stripe requires the raw body for signature verification.
  // Configure this route with express.raw() middleware in main.ts if enabling webhooks fully.
  @Post('stripe/webhook')
  handleStripeWebhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
    return this.paymentsService.handleStripeWebhook(req.body, signature);
  }

  @UseGuards(JwtAuthGuard)
  @Post('razorpay/order')
  createRazorpayOrder(@Body() dto: CreateOrderPaymentDto) {
    return this.paymentsService.createRazorpayOrder(dto.orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('razorpay/verify')
  verifyRazorpay(@Body() dto: VerifyRazorpayDto) {
    return this.paymentsService.verifyRazorpayPayment(dto);
  }
}
