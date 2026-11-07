import { Controller, Get, Header } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Header('Cache-Control', 'public, max-age=600')
  @Get('rates')
  getRates() {
    return this.currencyService.getRates();
  }
}
