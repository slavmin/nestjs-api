import { Document } from 'mongoose';
import { Message } from './message.interface';
import { User } from '../../users/interfaces/user.interface';

export interface Room extends Document {
  name: string;
  description?: string;
  owner: User;
  is_published: boolean;
  is_private: boolean;
  messages?: Message[];
  created_at: Date;
  updated_at: Date;
}
