import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomSchema } from './schemas/room.schema';
import { UsersModule } from '../users';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Room', schema: RoomSchema }]), UsersModule, TagsModule],
  providers: [RoomsService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
