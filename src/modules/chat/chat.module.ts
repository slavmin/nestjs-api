import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomsModule } from '../rooms/rooms.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, RoomsModule],
  providers: [ChatGateway],
})
export class ChatModule {}
