import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class UpdateDto {
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  country: string;
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  language: string;
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  password?: string;
  password_confirmation?: string;
  password_reset_token?: string;
}
