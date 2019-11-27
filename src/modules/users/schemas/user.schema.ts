import bcrypt from 'bcrypt';
import uuid from 'uuid/v4';
import { Schema, HookNextFunction } from 'mongoose';
import { Role, Status } from './../enums/enums';
import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

export const UserSchema = new Schema(
  {
    uuid: {
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
      sparse: true,
    },
    role: {
      type: String,
      enum: Object.values(Role).filter(v => isNaN(Number(v)) === true),
      default: Role[Role.user],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(Status).filter(v => isNaN(Number(v)) === true),
      default: Status[Status.iron],
      index: true,
    },
    country: {
      type: String,
      trim: true,
      index: true,
    },
    language: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    verification_code: {
      type: String,
      default: null,
      select: false,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    phone_verified: {
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
      // default: Date.now,
      default: null,
      select: false,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    ban_expires: {
      type: Date,
      // default: Date.now,
      default: null,
      select: false,
    },
    // created_at: { type: Date, default: Date.now, select: false },
    // updated_at: { type: Date, default: Date.now, select: false },
  },
  {
    versionKey: false,
    // timestamps: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

UserSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    ret.created_at = ret.created_at;
    delete ret.created_at;
    ret.updated_at = ret.updated_at;
    delete ret.updated_at;
  },
});

UserSchema.pre('save', async function(next: HookNextFunction) {
  /**
   * Generate uuid
   */
  if (this.isNew) {
    (this as any).uuid = uuid();
  }
  /**
   * On every save, add the date
   */
  // const currentDate = new Date();
  // (this as any).updated_at = currentDate;
  /**
   * Rehash password if modified
   */
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashedPass = await bcrypt.hash((this as any).password, 10);
    (this as any).password = hashedPass;
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.plugin(uniqueValidator).plugin(mongoosePaginate);
