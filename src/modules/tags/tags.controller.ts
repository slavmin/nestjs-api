import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from './interfaces/tag.interface';
import { CreateDto } from './dto/create.dto';
// import { ValidateObjectId } from './../../common/pipes/validate-object-id.pipe';
import { Roles } from './../../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Tags } from './seeds/seed';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll(): Promise<any[]> {
    const tags = await this.tagsService.getAll();
    const filtered = tags.filter(tag => tag.ancestors.length > 0);
    // const sortFiltered = filtered.sort((a, b) => a.parent.name.localeCompare(b.parent.name));
    const res = filtered.map(tag => {
      if (tag.ancestors.length > 0) {
        return { name: tag.name, parent: tag.parent.name };
      }
    });
    const sorted = res.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @Post()
  async create(@Body() createDto: CreateDto): Promise<Partial<Tag>> {
    return await this.tagsService.create(createDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @Post('/seed')
  async seed(@Body() createDto: CreateDto): Promise<any> {
    const seeds = Tags.map(async (v: any) => {
      return new Promise(async (resolve, reject) => {
        const exist = await this.tagsService.getOne({ name: v.name });
        const arr = [];
        if (!exist) {
          const parent = await this.tagsService.create({ name: v.name });
          arr.push(parent);
          const requests = v.childs.map(async (c: any) => {
            const res = await this.tagsService.create({ name: c.name, parent: parent._id, ancestors: [parent._id] });
            return arr.push(res);
          });
          await Promise.all(requests).catch(e => Logger.log(`Error in seeding childs for tag ${e}`));
        }
        // console.log('Arr:', arr);
        resolve(arr);
      });
    });

    return await Promise.all(seeds).catch(e => Logger.log(`Error in seeding tags ${e}`));
    // return await this.tagsService.create(createDto);
  }
}
