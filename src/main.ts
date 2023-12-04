import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import * as process from 'process';
import * as expressUserAgent from 'express-useragent';

dotenv.config();

import { MainModule } from './main.module';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MainModule, {
    logger: ['error', 'warn', 'log'],
    cors: true,
  });

  app.use(expressUserAgent.express());

  const PORT = process.env.PORT || 3333;

  await app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
bootstrap();
