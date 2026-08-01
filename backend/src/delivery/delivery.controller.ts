import { Controller, Get, Query } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('estimate')
  getEstimate(@Query('pincode') pincode: string) {
    return this.deliveryService.getEstimate(pincode);
  }
}
