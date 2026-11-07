import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: payment webhooks (Stripe, Razorpay) sign the exact bytes they send,
  // so the signature can only be checked against the unparsed request body.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  if ((process.env.JWT_SECRET || '').length < 32) {
    console.warn('[security] JWT_SECRET is shorter than 32 characters — use a long random value in production.');
  }

  // Standard protective headers (no sniffing, no framing, strict referrer policy, ...).
  // CORP is relaxed because the storefront is a different origin from this API.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  // Gzip responses — product lists are repetitive JSON and shrink a lot.
  app.use(compression());

  // Accept both the www and bare-domain variants of FRONTEND_URL, since a
  // single-character mismatch (e.g. missing "www.") is a very common way
  // for CORS to silently block everything. Only set FRONTEND_URL to one
  // variant — both are derived from it automatically.
  const frontendUrl = process.env.FRONTEND_URL;
  let allowedOrigins: string[] | string = '*';
  if (frontendUrl) {
    try {
      const url = new URL(frontendUrl);
      const bare = url.hostname.replace(/^www\./, '');
      allowedOrigins = [
        `${url.protocol}//${bare}`,
        `${url.protocol}//www.${bare}`,
      ];
    } catch {
      allowedOrigins = frontendUrl;
    }
  } else {
    console.warn('[security] FRONTEND_URL is not set — CORS is open to every origin.');
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    // Let browsers cache the CORS preflight for a day instead of re-asking
    // before every API call — noticeably fewer round trips on slow mobile networks.
    maxAge: 86400,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Lightweight endpoint for uptime/keep-alive pings — doesn't touch the database,
  // so it's cheap to hit every few minutes without adding load.
  app.getHttpAdapter().get('/health', (req, res) => res.status(200).send('ok'));

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
  console.log(`CORS allowed origins:`, allowedOrigins);
}
bootstrap();
