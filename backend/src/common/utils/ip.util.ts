import { Request } from 'express';
import * as geoip from 'geoip-lite';

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

export function getLocationFromIp(ip: string): string {
  try {
    const geo = geoip.lookup(ip);
    if (!geo) return 'Unknown';
    return [geo.city, geo.region, geo.country].filter(Boolean).join(', ');
  } catch {
    return 'Unknown';
  }
}
