import { Document } from 'mongoose';
import { Message } from './message.interface';
import { User } from '../../users/interfaces/user.interface';
import { Tag } from '../../tags/interfaces/tag.interface';

export interface Room extends Document {
  readonly id: string;
  readonly uuid: string;
  readonly owner: User;
  readonly name: string;
  gender: string;
  age: number;
  country: string;
  languages: string[];
  ethnicity: string;
  physique: string;
  hair: string;
  eyes?: string;
  orientation?: string;
  description?: string;
  tags?: Tag[];
  categories?: [];
  likes?: User[];
  followers?: User[];
  messages?: Message[];
  readonly created_at: Date;
  readonly updated_at: Date;
}
