import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ResetPassDto {
  @IsNotEmpty({ message: 'NOTEMPTY' })
  password_reset_token: string;
  @MinLength(6, { message: 'MIN:6' })
  @MaxLength(30, { message: 'MAX:30' })
  password: string;
  @IsNotEmpty({ message: 'NOTEMPTY' })
  password_confirmation?: string;
}
