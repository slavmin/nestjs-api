import { MaxLength, IsInt, Min, Max, IsOptional, IsIn, IsArray } from 'class-validator';
import { Gender } from './../enums/enums';
import { Tag } from 'src/modules/tags/interfaces/tag.interface';

export class CreateDto {
  @IsInt({ message: 'ISINTEGER' })
  @Min(18, { message: 'MIN:18' })
  @Max(108, { message: 'MAX:108' })
  age: number;

  @IsIn(
    Object.values(Gender).filter(v => isNaN(Number(v)) === true),
    { message: 'NOT_ACCEPTABLE_VALUE' },
  )
  gender: string;

  @IsOptional()
  @MaxLength(500, { message: 'MAX:500' })
  description?: string;

  @IsArray()
  tags: [Tag];
}
