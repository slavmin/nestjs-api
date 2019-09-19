import { IsNotEmpty, IsEmail } from 'class-validator';

export class EmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
