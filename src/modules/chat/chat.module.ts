import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomsModule } from '../rooms/rooms.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users';

@Module({
  imports: [AuthModule, UsersModule, RoomsModule],
  providers: [ChatGateway],
})
export class ChatModule {}
