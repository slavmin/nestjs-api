import { Schema, HookNextFunction } from 'mongoose';
import { RoomSchema } from '../../rooms/schemas/room.schema';
import uuid from 'uuid/v4';

export const TagSchema = new Schema(
  {
    uuid: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    },
    ancestors: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    created_at: { type: Date, default: Date.now, select: false },
    updated_at: { type: Date, default: Date.now, select: false },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

TagSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

TagSchema.pre('save', async function(next: HookNextFunction) {
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
