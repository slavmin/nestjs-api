import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @MinLength(2, { message: 'MIN:2' })
  @MaxLength(30, { message: 'MAX:30' })
  name: string;
  @IsEmail({}, { message: 'EMAIL:NOTVALID' })
  email: string;
  @MinLength(6, { message: 'MIN:6' })
  @MaxLength(30, { message: 'MAX:30' })
  password: string;
  @IsNotEmpty({ message: 'NOTEMPTY' })
  password_confirmation?: string;
}

export interface UpdateDto {
  country: string;
  language: string;
  picture_url: string;
  password?: string;
  password_confirmation?: string;
  password_reset_token?: string;
}

export interface ServiceDto {
  verification_code?: string;
  email_verified?: boolean;
  password_reset_token?: string;
  password_reset_expires?: string;
  login_attempts?: number;
  blocked?: boolean;
  block_expires?: any;
  banned?: boolean;
  ban_expires?: any;
}
