import { Module, Global } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  imports: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
