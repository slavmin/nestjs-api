import { MinLength, MaxLength, IsOptional, IsArray } from 'class-validator';
import { Tag } from './../interfaces/tag.interface';

export class CreateDto {
  @MinLength(2, { message: 'MIN:2' })
  @MaxLength(30, { message: 'MAX:30' })
  name: string;
  @IsOptional()
  @MaxLength(250, { message: 'MAX:250' })
  description?: string;
  parent?: Tag;
  @IsOptional()
  @IsArray()
  ancestors?: [Tag];
}
