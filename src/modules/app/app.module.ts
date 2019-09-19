import { Module } from '@nestjs/common';
import { CommonModule } from './../common/common.module';
import { AuthModule } from '../auth';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppModule],
})
export class AppModule {}
