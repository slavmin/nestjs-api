import bcrypt from 'bcrypt';
import uuid from 'uuid';
import { Schema, HookNextFunction } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

export const UserSchema = new Schema(
  {
    uid: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'member', 'admin'],
      default: 'user',
    },
    verification_code: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    password_reset_token: {
      type: String,
      select: false,
    },
    password_reset_expires: {
      type: Date,
      select: false,
    },
    login_attempts: {
      type: Number,
      default: 0,
      select: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    block_expires: {
      type: Date,
      default: Date.now,
      select: false,
    },
    created_at: { type: Date, default: Date.now, select: false },
    updated_at: { type: Date, default: Date.now, select: false },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

UserSchema.pre('save', async function(next: HookNextFunction) {
  /**
   * Generate uuid
   */
  if (this.isNew) {
    (this as any).uid = await uuid.v4();
  }
  /**
   * On every save, add the date
   */
  const currentDate = new Date();
  (this as any).updated_at = currentDate;
  /**
   * Rehash password if modified
   */
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashed = await bcrypt.hash((this as any).password, 10);
    (this as any).password = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.plugin(uniqueValidator).plugin(mongoosePaginate);
