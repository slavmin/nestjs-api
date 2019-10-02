import { Module, Global, CacheModule, Inject, CACHE_MANAGER, Logger } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '../config';
import { DatabaseModule } from '../database/database.module';
// import { UsersModule, UsersService } from '../users';
import { AuthModule } from '../auth';
import { MailerModule, PugAdapter, HandlebarsAdapter } from '@nest-modules/mailer';
import { LoggingInterceptor } from './../../common/interceptors/logging.interceptor';
import { ErrorsInterceptor } from './../../common/interceptors/exception.interceptor';
import { TransformInterceptor } from './../../common/interceptors/transform.interceptor';
import * as redisStore from 'cache-manager-redis-store';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: configService.get('CACHE_TTL'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          auth: {
            user: configService.get('MAIL_USERNAME'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get('APP_MAIL'),
        },
        template: {
          dir: join(__dirname, '../../../views', 'mail'),
          adapter: new PugAdapter(), // or new HandlebarsAdapter()
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [ConfigModule, DatabaseModule, AuthModule, CacheModule, MailerModule],
})
export class CommonModule {
  private logger: Logger = new Logger('CommonModule');

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager) {
    const client = cacheManager.store.getClient();

    client.on('error', (error: any) => {
      this.logger.log(error);
    });
  }
}
