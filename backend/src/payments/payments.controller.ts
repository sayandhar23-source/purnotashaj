import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RateLimit } from '../common/throttle/rate-limit';
import { CreateOrderPaymentDto, VerifyRazorpayDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @RateLimit(15)
  @UseGuards(JwtAuthGuard)
  @Post('stripe/checkout-session')
  createStripeSession(@CurrentUser() user: any, @Body() dto: CreateOrderPaymentDto) {
    return this.paymentsService.createStripeCheckoutSession(dto.orderId, user.userId);
  }

  // Called by Stripe, not a browser — authenticated by its signature over the raw body
  @Post('stripe/webhook')
  handleStripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    return this.paymentsService.handleStripeWebhook(req.rawBody, signature);
  }

  @RateLimit(15)
  @UseGuards(JwtAuthGuard)
  @Post('razorpay/order')
  createRazorpayOrder(@CurrentUser() user: any, @Body() dto: CreateOrderPaymentDto) {
    return this.paymentsService.createRazorpayOrder(dto.orderId, user.userId);
  }

  @RateLimit(15)
  @UseGuards(JwtAuthGuard)
  @Post('razorpay/verify')
  verifyRazorpay(@CurrentUser() user: any, @Body() dto: VerifyRazorpayDto) {
    return this.paymentsService.verifyRazorpayPayment(dto, user.userId);
  }

  // Called by Razorpay — authenticated by its signature over the raw body
  @Post('razorpay/webhook')
  handleRazorpayWebhook(@Req() req: RawBodyRequest<Request>, @Headers('x-razorpay-signature') signature: string) {
    return this.paymentsService.handleRazorpayWebhook(req.rawBody, signature);
  }
}
