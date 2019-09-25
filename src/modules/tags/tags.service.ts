import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Tag } from './interfaces/tag.interface';

@Injectable()
export class TagsService {
  constructor(@InjectModel('Tag') private readonly tagModel: Model<Tag>) {}

  async create(tag: Tag): Promise<Tag> {
    const createdTag = new this.tagModel(tag);
    return await createdTag.save();
  }

  async getAll(options?: any): Promise<Tag[]> {
    return await this.tagModel.find(options).exec();
  }

  async getById(id: string): Promise<Tag | null> {
    return await this.tagModel.findById(id).exec();
  }

  async getOne(options?: any, fields?: any): Promise<Tag | null> {
    return await this.tagModel.findOne(options, fields).exec();
  }

  async update(id: string, newValue: Tag): Promise<Tag | null> {
    return await this.tagModel.findByIdAndUpdate(id, newValue).exec();
  }

  async delete(id: string): Promise<Tag | null> {
    return await this.tagModel.findByIdAndRemove(id).exec();
  }
}
