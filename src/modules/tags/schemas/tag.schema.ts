import { Schema, HookNextFunction } from 'mongoose';
import { RoomSchema } from '../../rooms/schemas/room.schema';

export const TagSchema = new Schema(
  {
    name: { type: String, required: true, lowercase: true, trim: true, unique: true },
    description: { type: String },
    created_at: { type: Date, default: Date.now, select: false },
    updated_at: { type: Date, default: Date.now, select: false },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

/**
 * On every save, add the date
 */
TagSchema.pre('save', async function(next: HookNextFunction) {
  const currentDate = new Date();

  (this as any).updated_at = currentDate;
  next();
});
