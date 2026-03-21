import { INestApplication, ValidationPipe } from '@nestjs/common';

/** Match `main.ts` so DTO validation runs in e2e the same as production */
export function setupE2eApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
