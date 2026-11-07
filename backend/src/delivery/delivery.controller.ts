import { Controller, Get, Query } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { RateLimit } from '../common/throttle/rate-limit';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @RateLimit(40)
  @Get('estimate')
  getEstimate(@Query('pincode') pincode: string) {
    return this.deliveryService.getEstimate(pincode);
  }
}
