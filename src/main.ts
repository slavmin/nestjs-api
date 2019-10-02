import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
// import Express from 'express';

import helmet from 'helmet';
// import compression from 'compression';
import slowDown from 'express-slow-down';
// import rateLimit from 'express-rate-limit';

import { AppModule } from './modules/app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
// import { ValidationPipe } from './common/pipes/validation.pipe';

// const server = Express();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  app.enableCors();
  app.use(helmet());
  // app.use(compression());
  app.use(
    slowDown({
      windowMs: 10 * 60 * 1000,
      delayAfter: 200,
      delayMs: 100,
    }),
  );
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true }));
  await app.listen(process.env.APP_PORT || 4000);
}
bootstrap();
