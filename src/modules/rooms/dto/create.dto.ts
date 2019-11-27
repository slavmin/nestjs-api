import { MaxLength, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';
import { Gender, Ethnicity, Physique, Hair, Eyes, Orientation } from './../enums/enums';

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
  @IsIn(
    Object.values(Ethnicity).filter(v => isNaN(Number(v)) === true),
    { message: 'NOT_ACCEPTABLE_VALUE' },
  )
  ethnicity: string;
  @IsIn(
    Object.values(Physique).filter(v => isNaN(Number(v)) === true),
    { message: 'NOT_ACCEPTABLE_VALUE' },
  )
  physique: string;
  @IsIn(
    Object.values(Hair).filter(v => isNaN(Number(v)) === true),
    { message: 'NOT_ACCEPTABLE_VALUE' },
  )
  hair: string;
  @IsOptional()
  @IsIn(
    Object.values(Eyes).filter(v => isNaN(Number(v)) === true),
    { message: 'NOT_ACCEPTABLE_VALUE' },
  )
  eyes?: string;
  @IsOptional()
  @IsIn(
    Object.values(Orientation).filter(v => isNaN(Number(v)) === true),
    { message: 'NOT_ACCEPTABLE_VALUE' },
  )
  orientation?: string;
  @MaxLength(500, { message: 'MAX:500' })
  description?: string;
}
