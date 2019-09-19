import { ConfigService, ConfigModule } from '../config';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';

export const databaseProviders = [
  MongooseModule.forRootAsync({
    // imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      uri: process.env.NODE_ENV === 'test' ? config.get('MONGODB_URI_TEST') : config.get('MONGODB_URI'),
      retryDelay: 500,
      retryAttempts: 5,
      useFindAndModify: false,
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }),
  }),
];
