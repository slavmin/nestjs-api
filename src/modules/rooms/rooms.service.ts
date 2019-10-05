import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { UsersService } from '../users';
import { Room } from './interfaces/room.interface';
// import { Message } from './interfaces/message.interface';
import { User } from './../users/interfaces/user.interface';
import * as _ from 'lodash';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel('Room') private readonly roomModel: Model<Room>,
    private readonly usersService: UsersService,
  ) {}

  private static sanitizeOutput(room: Room) {
    return _.pick(room, [
      'id',
      'uuid',
      'owner',
      'name',
      'description',
      'tags',
      'categories',
      'likes',
      'followers',
      'messages',
    ]);
  }

  async create(room: Room, user: User): Promise<Partial<Room>> {
    const is_exist = await this.roomModel.findOne({ owner: user.id }).exec();
    if (is_exist) {
      throw new HttpException('EXIST_ALREADY', HttpStatus.BAD_REQUEST);
    }
    const createDTO = { ...room, name: user.name, owner: user.id };
    const createdRoom = await this.roomModel.create(createDTO);
    return await this.getById(createdRoom._id);
  }

  async getAll(options?: any): Promise<Room[]> {
    return await this.roomModel.find(options).exec();
  }

  async getById(id: string): Promise<Partial<Room> | null> {
    // RoomsService.isIdValid(id);
    const room = await this.roomModel
      .findById(id)
      .populate({ path: 'owner', select: 'id uuid name role status country language' })
      .exec();
    return room ? RoomsService.sanitizeOutput(room) : null;
  }

  async getOne(options?: any, fields?: any): Promise<Partial<Room> | null> {
    const room = await this.roomModel.findOne(options, fields).exec();
    return room ? await this.getById(room.id) : null;
  }

  async update(id: string, newValue: Room): Promise<Partial<Room> | null> {
    // RoomsService.isIdValid(id);
    const room = await this.roomModel.findByIdAndUpdate(id, newValue).exec();
    return room ? await this.getById(room.id) : null;
  }

  async delete(id: string): Promise<Room | null> {
    // RoomsService.isIdValid(id);
    return await this.roomModel.findByIdAndRemove(id).exec();
  }

  private static isIdValid(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return;
  }
}
