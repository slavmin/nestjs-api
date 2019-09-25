import { Document } from 'mongoose';

export interface Tag extends Document {
  name: String;
  description?: String;
  created_at: Date;
  updated_at: Date;
}
