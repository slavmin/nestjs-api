import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'EMAIL:NOTVALID' })
  email: string;
  @MinLength(6, { message: 'MIN:6' })
  @MaxLength(30, { message: 'MAX:30' })
  password: string;
}
