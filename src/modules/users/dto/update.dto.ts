import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class UpdateDto {
  @MinLength(2, { message: 'MIN:2' })
  @MaxLength(30, { message: 'MAX:30' })
  country: string;
  @MinLength(2, { message: 'MIN:2' })
  @MaxLength(30, { message: 'MAX:30' })
  language: string;
  @MinLength(6, { message: 'MIN:6' })
  @MaxLength(30, { message: 'MAX:30' })
  password?: string;
  @IsNotEmpty({ message: 'NOTEMPTY' })
  password_confirmation?: string;
  @IsNotEmpty({ message: 'NOTEMPTY' })
  password_reset_token?: string;
}
