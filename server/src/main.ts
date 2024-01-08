import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV !== 'production' || process.env.DEBUG == 'true'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['error', 'warn', 'log'],
  });
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
