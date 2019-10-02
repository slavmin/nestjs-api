import { Module, MiddlewareConsumer } from '@nestjs/common';
import { CommonModule } from './../common/common.module';
// import { AuthModule } from '../auth';
// import { info } from 'console';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './../chat/chat.module';
import { AuthMiddleware } from './../../common/middleware/auth.middleware';

@Module({
  imports: [CommonModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppModule],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('/');
  }
}
