import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from './interfaces/tag.interface';
import { CreateDto } from './dto/create.dto';
// import { ValidateObjectId } from './../../common/pipes/validate-object-id.pipe';
import { Roles } from './../../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll(): Promise<Tag[]> {
    return await this.tagsService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @Post()
  async create(@Body() createDto: CreateDto): Promise<Partial<Tag>> {
    return await this.tagsService.create(createDto);
  }
}
