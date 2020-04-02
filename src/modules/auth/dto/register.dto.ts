import { IsNotEmpty, IsEmail, IsAlphanumeric, MaxLength, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @MinLength(2, { message: 'MIN:2' })
  @MaxLength(30, { message: 'MAX:30' })
  @IsAlphanumeric('en-US', { message: 'ALPHANUMERIC' })
  username: string;
  @IsEmail({}, { message: 'EMAIL:NOTVALID' })
  email: string;
  @MinLength(6, { message: 'MIN:6' })
  @MaxLength(30, { message: 'MAX:30' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'TOOWEAK' })
  password: string;
  @IsNotEmpty({ message: 'NOTEMPTY' })
  password_confirmation?: string;
}
