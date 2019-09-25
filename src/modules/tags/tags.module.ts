import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TagSchema } from './schemas/tag.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Tag', schema: TagSchema }])],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
