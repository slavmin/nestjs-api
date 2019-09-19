import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  name: string;
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

export interface UpdateDto {
  country: string;
  language: string;
  password?: string;
  password_confirmation?: string;
  password_reset_token?: string;
}

export interface ServiceDto {
  verification_code?: string;
  verified?: boolean;
  password_reset_token?: string;
  password_reset_expires?: string;
  login_attempts?: number;
  blocked?: boolean;
  block_expires?: any;
}
