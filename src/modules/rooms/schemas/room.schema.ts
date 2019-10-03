import { Schema, HookNextFunction } from 'mongoose';
import { TagSchema } from '../../tags/schemas/tag.schema';
import { UserSchema } from '../../users/schemas/user.schema';
import uuid from 'uuid/v4';

export const RoomSchema = new Schema(
  {
    uuid: {
      type: String,
      unique: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    categories: [],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [],
    created_at: { type: Date, default: Date.now, select: false },
    updated_at: { type: Date, default: Date.now, select: false },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

RoomSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

RoomSchema.pre('save', async function(next: HookNextFunction) {
  /**
   * Generate uuid
   */
  if (this.isNew) {
    (this as any).uuid = uuid();
  }
  /**
   * On every save, add the date
   */
  const currentDate = new Date();
  (this as any).updated_at = currentDate;
  next();
});
