import { Module, CacheModule, CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { CommonModule } from './../common/common.module';
// import { AuthModule } from '../auth';
import * as redisStore from 'cache-manager-redis-store';
import { info } from 'console';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './../chat/chat.module';

@Module({
  imports: [
    CommonModule,
    ChatModule,
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppModule],
})
export class AppModule {
  private logger: Logger = new Logger('AppModule');

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager) {
    const client = cacheManager.store.getClient();

    client.on('error', error => {
      this.logger.log(error);
    });
  }
}
