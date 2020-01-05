import { MaxLength, IsInt, Min, Max, IsOptional, IsIn, IsArray, IsString } from 'class-validator';
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
  @IsString({ message: 'ISSTRING' })
  picture_url: string;
  @IsOptional()
  @IsString({ message: 'ISSTRING' })
  ethnicity: string;
  @IsOptional()
  @IsString({ message: 'ISSTRING' })
  physique: string;
  @IsOptional()
  @IsString({ message: 'ISSTRING' })
  hair: string;
  @IsOptional()
  @IsString({ message: 'ISSTRING' })
  eyes: string;
  @IsOptional()
  @IsString({ message: 'ISSTRING' })
  orientation: string;
  @IsOptional()
  @IsString({ message: 'ISSTRING' })
  subculture: string;

  @IsOptional()
  @MaxLength(500, { message: 'MAX:500' })
  description: string;

  @IsOptional()
  @IsArray({ message: 'ISARRAY' })
  activity: [Tag];

  @IsOptional()
  @IsArray({ message: 'ISARRAY' })
  specifics: [Tag];

  @IsOptional()
  @IsArray({ message: 'ISARRAY' })
  tags: [Tag];
}
