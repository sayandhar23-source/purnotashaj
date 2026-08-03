import { Injectable } from '@nestjs/common';
import { Request } from 'express';

export type GeoResult = {
  available: boolean;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  countryCode?: string | null;
};

@Injectable()
export class GeoService {
  // Render sits behind a proxy — the real visitor IP arrives via
  // X-Forwarded-For, not the raw socket address.
  getClientIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return first.trim();
    }
    return req.socket?.remoteAddress || null;
  }

  private isPrivateIp(ip: string): boolean {
    return ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.');
  }

  async lookup(ip: string | null): Promise<GeoResult> {
    if (!ip || this.isPrivateIp(ip)) return { available: false };

    try {
      const res = await fetch(`https://free.freeipapi.com/api/json/${ip}`);
      if (!res.ok) return { available: false };
      const data = await res.json();

      return {
        available: true,
        city: data.cityName || null,
        region: data.regionName || null,
        country: data.countryName || null,
        countryCode: data.countryCode || null,
      };
    } catch {
      return { available: false };
    }
  }

  // Used to enforce India-only checkout. Fails OPEN (treats as India) when
  // the lookup itself is unavailable — a broken geolocation service should
  // never be the reason a genuine Indian customer can't check out; the real
  // enforcement backstop for a wrongly-allowed international order is your
  // own order review, not this check alone.
  async isIndianIp(ip: string | null): Promise<boolean> {
    const geo = await this.lookup(ip);
    if (!geo.available) return true;
    return geo.countryCode === 'IN' || geo.country === 'India';
  }
}
