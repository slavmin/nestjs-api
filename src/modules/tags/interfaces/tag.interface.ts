import { Document } from 'mongoose';

export interface Tag extends Document {
  readonly id: string;
  readonly uuid: string;
  name: string;
  description?: string;
  parent: Tag;
  ancestors?: [Tag];
  readonly created_at: Date;
  readonly updated_at: Date;
}
