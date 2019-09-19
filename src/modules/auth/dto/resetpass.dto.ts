import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ResetPassDto {
  @IsNotEmpty()
  password_reset_token: string;
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  password: string;
  @IsNotEmpty()
  password_confirmation: string;
}
