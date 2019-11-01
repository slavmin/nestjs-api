import { IsNotEmpty, IsEmail, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @MinLength(3, { message: 'MIN:2' })
  @MaxLength(30, { message: 'MAX:30' })
  username: string;
  @IsEmail({}, { message: 'EMAIL:NOTVALID' })
  email: string;
  @MinLength(6, { message: 'MIN:6' })
  @MaxLength(30, { message: 'MAX:30' })
  password: string;
  @IsNotEmpty({ message: 'NOTEMPTY' })
  password_confirmation?: string;
}
