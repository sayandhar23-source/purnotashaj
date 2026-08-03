import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('geo')
export class GeoController {
  // Extracts the real visitor IP — Render sits behind a proxy, so the
  // original client IP arrives via X-Forwarded-For, not the socket address.
  private getClientIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return first.trim();
    }
    return req.socket?.remoteAddress || null;
  }

  @Get('me')
  async getMyLocation(@Req() req: Request) {
    const ip = this.getClientIp(req);

    // Local/private IPs (dev environment, or if forwarding isn't set up)
    // can't be geolocated — fail quietly rather than returning garbage.
    if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
      return { available: false };
    }

    try {
      const res = await fetch(`https://free.freeipapi.com/api/json/${ip}`);
      if (!res.ok) return { available: false };
      const data = await res.json();

      return {
        available: true,
        city: data.cityName || null,
        region: data.regionName || null,
        country: data.countryName || null,
      };
    } catch {
      return { available: false };
    }
  }
}
