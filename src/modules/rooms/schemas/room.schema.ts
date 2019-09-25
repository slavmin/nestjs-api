import { Schema, HookNextFunction } from 'mongoose';
import { TagSchema } from '../../tags/schemas/tag.schema';
import { UserSchema } from '../../users/schemas/user.schema';

export const RoomSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    messages: [],
    is_published: { type: Boolean, default: true },
    is_private: { type: Boolean, default: false },
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
RoomSchema.pre('save', async function(next: HookNextFunction) {
  const currentDate = new Date();

  (this as any).updated_at = currentDate;
  next();
});
