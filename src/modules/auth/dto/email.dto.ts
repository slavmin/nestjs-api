import { IsNotEmpty, IsEmail } from 'class-validator';

export class EmailDto {
  @IsEmail({}, { message: 'EMAIL:NOTVALID' })
  email: string;
}
