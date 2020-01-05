import { Schema, HookNextFunction } from 'mongoose';
import { Gender } from './../enums/enums';
import uuid from 'uuid/v4';
import uniqueValidator from 'mongoose-unique-validator';
import { Room } from '../interfaces/room.interface';

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
      unique: true,
      required: true,
    },
    picture_url: {
      type: String,
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      index: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender).filter(v => isNaN(Number(v)) === true),
      default: Gender[Gender.girl],
      index: true,
    },
    description: {
      type: String,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag', index: true }],
    languages: [{ type: Schema.Types.ObjectId, ref: 'Tag', index: true }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: [String] }],
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

RoomSchema.set('toJSON', {
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

RoomSchema.pre<Room>('save', async function(next: HookNextFunction) {
  /**
   * Generate uuid
   */
  if (this.isNew) {
    this.uuid = uuid();
  }
  next();
});

RoomSchema.plugin(uniqueValidator);
