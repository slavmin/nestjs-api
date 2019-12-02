import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { TagsService } from './../../tags/tags.service';
import { Types } from 'mongoose';

@Injectable()
export class ValidateRoomObject implements PipeTransform<string> {
  constructor(private readonly tagsService: TagsService) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    const tags: any[] = await this.tagsService.getAll();
    const tagsCategories = {};
    const outData = {};

    if (tags) {
      Object.values(tags).map(val => {
        if (ValidateRoomObject.isIdValid(val.parent)) {
          const item = { name: val.name, id: val._id };
          const parentId = val.parent.toString();
          tagsCategories[parentId].childs.push(item);
        } else {
          const item = { name: val.name, id: val._id };
          const Id = val._id.toString();
          tagsCategories[Id] = item;
          tagsCategories[Id].childs = [];
        }
      });

      const categories: object = Object.values(tagsCategories);
      const bodyKeys = Object.keys(value);
      // Object.entries(tagsCategories).forEach(([key, value]) => console.log(`${key}: ${value}`));
      Object.values(categories).forEach(val => {
        if (bodyKeys.includes(val.name)) {
          Object.values(val.childs).forEach(child => {
            const childObj: any = child;
            if (childObj.name === value[val.name]) {
              outData[val.name] = value[val.name];
            }
          });
        }
        // bodyKeys.includes(val.name) ? console.log(`${val.name}: ${value[val.name]}`) : null;
      });
      // console.log(outData);
    }
    return outData;
  }

  private static isIdValid(id: any) {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    return true;
  }
}
