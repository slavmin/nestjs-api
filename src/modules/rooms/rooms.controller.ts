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
import { ValidateObjectId } from './../../common/pipes/validate-object-id.pipe';
import { Roles } from './../../common/decorators/roles.decorator';
import { RolesGuard } from './../../common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async findAll(): Promise<Room[]> {
    return await this.roomsService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id', ValidateObjectId) roomId: string): Promise<Partial<Room>> {
    const room = await this.roomsService.getById(roomId);
    if (!room) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return room;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('member')
  @Post()
  async create(@Body() createDto: Room, @Request() req: any): Promise<Partial<Room>> {
    return await this.roomsService.create(createDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('member')
  @Patch(':id')
  async update(
    @Param('id', ValidateObjectId) roomId: string,
    @Body() createDto: Room,
    @Request() req: any,
  ): Promise<Partial<Room>> {
    const room = await this.roomsService.getById(roomId);
    if (room.owner.id !== req.user.id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    return await this.roomsService.update(roomId, createDto);
  }
}
