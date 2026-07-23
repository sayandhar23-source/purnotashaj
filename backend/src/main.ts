import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
  console.log(`CORS allowed origins:`, allowedOrigins);
}
bootstrap();
