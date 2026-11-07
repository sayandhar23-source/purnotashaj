import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private geoService: GeoService) {}

  @Get('me')
  async getMyLocation(@Req() req: Request) {
    const ip = this.geoService.getClientIp(req);
    const geo = await this.geoService.lookup(ip);
    return {
      ...geo,
      isIndia: geo.available ? geo.countryCode === 'IN' || geo.country === 'India' : true,
    };
  }
}
