import { Document } from 'mongoose';
import { User } from '../../users/interfaces/user.interface';

export interface Message extends Document {
  message: string;
  user: User;
  date: Date;
}
