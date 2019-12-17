import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './interfaces/room.interface';
import { CreateDto } from './dto/create.dto';
import { TagsService } from './../tags/tags.service';
import { ValidateObjectId } from './../../common/pipes/validate-object-id.pipe';
import { Roles } from './../../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ValidateRoomObject } from './pipes/validate-room-object.pipe';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService, private readonly tagsService: TagsService) {}

  @Get()
  async findAll(): Promise<Room[]> {
    return await this.roomsService.getAll();
  }

  @Get('/chats/:cat/:value')
  async findByGenderAndTag(@Param('cat') cat: string, @Param('value') value: string): Promise<Partial<Room>> {
    const category = cat.slice(0, cat.length - 1);
    const tag = await this.tagsService.getOne({ name: value });
    if (!tag) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const rooms = await this.roomsService.getAll({
      //   $and: [{ gender: category, age: { $gte: 21, $lte: 29 } }, { tags: { $in: [tag._id] } }],
      $and: [{ gender: category }, { tags: { $in: [tag._id] } }],
    });
    if (Array.isArray(rooms) && !rooms.length) {
      throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
    }
    return rooms;
  }

  @Get('/chats/:cat')
  async findByGender(@Param('cat') cat: string): Promise<Partial<Room>> {
    const category = cat.slice(0, cat.length - 1);
    const rooms = await this.roomsService.getAll({ gender: category });
    if (Array.isArray(rooms) && !rooms.length) {
      throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
    }
    return rooms;
  }

  @Get(':id')
  async findOne(@Param('id', ValidateObjectId) roomId: string): Promise<Partial<Room>> {
    const room = await this.roomsService.getById(roomId);
    if (!room) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return room;
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('member')
  @Post()
  async create(@Body() createDto: CreateDto, @Request() req: any): Promise<Partial<Room>> {
    return await this.roomsService.create(createDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('member')
  @Patch(':id')
  async update(
    @Param('id', ValidateObjectId) roomId: string,
    @Body(ValidateRoomObject) createDto: CreateDto,
    @Request() req: any,
  ): Promise<Partial<Room>> {
    const room = await this.roomsService.getById(roomId);
    if (!room) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (room.owner.id !== req.user.id) {
      if (req.user.role !== 'admin') {
        throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
      }
    }
    return await this.roomsService.update(roomId, createDto);
  }
}
