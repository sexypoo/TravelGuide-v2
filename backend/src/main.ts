import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { StructuredLogger } from './common/logging/structured-logger';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new StructuredLogger(process.env.NODE_ENV !== 'test'),
  });
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('API_PORT');

  configureApp(app);
  app.set('trust proxy', 1);
  await app.listen(port);
  Logger.log(`API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();
