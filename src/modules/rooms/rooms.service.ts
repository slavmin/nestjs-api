import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Room } from './interfaces/room.interface';
import { Message } from './interfaces/message.interface';

@Injectable()
export class RoomsService {
  constructor(@InjectModel('Room') private readonly roomModel: Model<Room>) {}

  async create(room: Room): Promise<Room> {
    const createdRoom = new this.roomModel(room);
    return await createdRoom.save();
  }

  async getAll(options?: any): Promise<Room[]> {
    return await this.roomModel.find(options).exec();
  }

  async getById(id: string): Promise<Room | null> {
    return await this.roomModel.findById(id).exec();
  }

  async getOne(options?: any, fields?: any): Promise<Room | null> {
    return await this.roomModel.findOne(options, fields).exec();
  }

  async update(id: string, newValue: Room): Promise<Room | null> {
    return await this.roomModel.findByIdAndUpdate(id, newValue).exec();
  }

  async delete(id: string): Promise<Room | null> {
    return await this.roomModel.findByIdAndRemove(id).exec();
  }
}
