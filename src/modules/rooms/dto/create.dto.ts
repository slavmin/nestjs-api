import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { User } from '../../users/interfaces/user.interface';

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  name: string;
  @IsNotEmpty()
  @MinLength(3)
  description: string;
  @IsNotEmpty()
  owner: User;
}
