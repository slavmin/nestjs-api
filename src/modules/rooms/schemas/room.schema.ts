import { Schema, HookNextFunction } from 'mongoose';
import { TagSchema } from '../../tags/schemas/tag.schema';
import { UserSchema } from '../../users/schemas/user.schema';
import { Gender, Ethnicity, Physique, Hair, Eyes, Orientation } from './../enums/enums';
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
    ethnicity: {
      type: String,
      enum: Object.values(Ethnicity).filter(v => isNaN(Number(v)) === true),
      default: Ethnicity[Ethnicity.white],
      index: true,
    },
    physique: {
      type: String,
      enum: Object.values(Physique).filter(v => isNaN(Number(v)) === true),
      default: Physique[Physique.medium],
      index: true,
    },
    hair: {
      type: String,
      enum: Object.values(Hair).filter(v => isNaN(Number(v)) === true),
      default: Hair[Hair.blonde],
      index: true,
    },
    eyes: {
      type: String,
      enum: Object.values(Eyes).filter(v => isNaN(Number(v)) === true),
      default: Eyes[Eyes.brown],
      index: true,
    },
    orientation: {
      type: String,
      enum: Object.values(Orientation).filter(v => isNaN(Number(v)) === true),
      default: Orientation[Orientation.straight],
      index: true,
    },
    description: {
      type: String,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    categories: [],
    languages: [],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [],
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

RoomSchema.pre('save', async function(next: HookNextFunction) {
  /**
   * Generate uuid
   */
  if (this.isNew) {
    (this as any).uuid = uuid();
  }
  next();
});
