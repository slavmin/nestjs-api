import bcrypt from 'bcrypt';
import uuid from 'uuid';
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

export const UserSchema = new mongoose.Schema(
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
    createdAt: { type: Date, select: false },
    updatedAt: { type: Date, select: false },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

UserSchema.pre('save', async function(next: mongoose.HookNextFunction) {
  if (this.isNew) {
    (this as any).uid = await uuid.v4();
  }
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
