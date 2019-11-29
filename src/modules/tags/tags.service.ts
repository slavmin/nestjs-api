import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Tag } from './interfaces/tag.interface';
import { CreateDto } from './dto/create.dto';
import * as _ from 'lodash';

@Injectable()
export class TagsService {
  constructor(@InjectModel('Tag') private readonly tagModel: Model<Tag>) {}

  private static sanitizeOutput(tag: Tag) {
    return _.omit(tag, ['created_at', 'updated_at']);
  }

  async create(createDto: CreateDto): Promise<Tag> {
    const createdTag = new this.tagModel(createDto);
    return await createdTag.save();
  }

  async getAll(options?: any): Promise<Tag[]> {
    return await this.tagModel.find(options).exec();
  }

  async getById(id: string): Promise<Partial<Tag> | null> {
    const tag = await this.tagModel.findById(id).exec();
    return tag ? TagsService.sanitizeOutput(tag) : null;
  }

  async getOne(options?: any, fields?: any): Promise<Partial<Tag> | null> {
    const tag = await this.tagModel.findOne(options, fields).exec();
    return tag ? TagsService.sanitizeOutput(tag) : null;
  }

  async update(id: string, newValue: Tag): Promise<Tag | null> {
    return await this.tagModel.findByIdAndUpdate(id, newValue).exec();
  }

  async delete(id: string): Promise<Tag | null> {
    return await this.tagModel.findByIdAndRemove(id).exec();
  }
}
