import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { TagsService } from './../../tags/tags.service';
import { Types } from 'mongoose';

@Injectable()
export class ValidateRoomObject implements PipeTransform<string> {
  constructor(private readonly tagsService: TagsService) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    const tags: any[] = await this.tagsService.getAll();
    const valueObj: any = JSON.parse(JSON.stringify(value));
    const tagsCategories = {};
    const outData = {};
    const tagsArr = [];

    if (tags) {
      Object.values(tags).map((val) => {
        if (val.parent && ValidateRoomObject.isIdValid(val.parent._id)) {
          const item = { name: val.name, description: val.description, id: val._id };
          const parentId = val.parent._id.toString();
          tagsCategories[parentId].childs.push(item);
        } else {
          const item = { name: val.name, description: val.description, id: val._id };
          const Id = val._id.toString();
          tagsCategories[Id] = item;
          tagsCategories[Id].childs = [];
        }
      });

      const categories: object = Object.values(tagsCategories);
      const bodyKeys = Object.keys(value);

      Object.values(categories).forEach((val) => {
        if (bodyKeys.includes(val.name)) {
          Object.values(val.childs).forEach((child) => {
            const childObj: any = child;
            if (val.name === 'age') {
              const ageDesc = childObj.description ? childObj.description.split('-') : null;
              const tagGender = ageDesc[0];
              const minAge = ageDesc[1];
              const maxAge = ageDesc[2];

              switch (valueObj.gender) {
                case 'girl':
                  if (
                    (value[val.name] >= minAge && value[val.name] <= maxAge && tagGender === valueObj.gender) ||
                    (value[val.name] >= minAge && value[val.name] <= maxAge && tagGender === 'any')
                  ) {
                    tagsArr.push(childObj.id);
                  }
                  break;

                case 'boy':
                  if (
                    (value[val.name] >= minAge && value[val.name] <= maxAge && tagGender === valueObj.gender) ||
                    (value[val.name] >= minAge && value[val.name] <= maxAge && tagGender === 'any')
                  ) {
                    tagsArr.push(childObj.id);
                  }
                  break;

                default:
                  break;
              }
            }
            if (Array.isArray(value[val.name])) {
              if (value[val.name].includes(childObj.name)) {
                if (!tagsArr.includes(childObj.id)) {
                  tagsArr.push(childObj.id);
                }
              }
            } else {
              if (childObj.name === value[val.name]) {
                outData[val.name] = value[val.name];
                tagsArr.push(childObj.id);
              }
            }
          });
        }
      });
      // Object.entries(tagsCategories).forEach(([key, value]) => console.log(`${key}: ${value}`));
      // console.log(JSON.stringify(tagsCategories));
    }
    return { ...valueObj, ...outData, ...{ tags: tagsArr } };
  }

  private static isIdValid(id: any) {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    return true;
  }
}
