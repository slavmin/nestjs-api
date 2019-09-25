import { Controller, Request, Get, HttpStatus, HttpException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './interfaces/room.interface';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async index(): Promise<Room[]> {
    return await this.roomsService.getAll();
  }

  @Get(':id')
  async show(@Request() req: any): Promise<Room> {
    const id = req.params.id;
    if (!id) {
      throw new HttpException('ID parameter is missing', HttpStatus.BAD_REQUEST);
    }

    const room = await this.roomsService.getById(id);
    if (!room) {
      throw new HttpException(`The room with the id: ${id} does not exists`, HttpStatus.BAD_REQUEST);
    }

    return room;
  }
}
