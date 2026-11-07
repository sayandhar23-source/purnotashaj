import { applyDecorators, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { getClientIp } from '../utils/ip.util';

// Rate limiting existed in the code (ThrottlerModule was configured) but no
// guard was ever applied, so it limited nothing — login, OTP and signup could
// be hammered freely.
//
// It is deliberately OPT-IN per route rather than global: the storefront's pages
// are rendered on Vercel's servers, so every customer's page-view reaches this
// API from the same few Vercel IP addresses. A blanket per-IP limit would start
// rejecting real customers' page loads. Only the sensitive endpoints are limited.
export const RATE_LIMITED = 'rate-limited';

export function RateLimit(limit: number, ttlSeconds = 60) {
  return applyDecorators(
    SetMetadata(RATE_LIMITED, true),
    Throttle({ default: { limit, ttl: ttlSeconds * 1000 } }),
  );
}

@Injectable()
export class SelectiveThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const limited = this.reflector.getAllAndOverride<boolean>(RATE_LIMITED, [
      context.getHandler(),
      context.getClass(),
    ]);
    return !limited;
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return getClientIp(req as any);
  }
}
