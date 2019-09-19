import { IsNotEmpty, IsEmail, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  username: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  password: string;
  @IsNotEmpty()
  password_confirmation?: string;
}
