import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import * as process from 'process';
import * as cookieParser from 'cookie-parser';

dotenv.config();

import { MainModule } from './main.module';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MainModule, {
    logger: ['error', 'warn', 'log'],
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  app.use(cookieParser());

  const PORT = process.env.PORT || 3333;

  await app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
bootstrap();
