import { Schema, HookNextFunction } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import uniqueValidator from 'mongoose-unique-validator';
import { Tag } from '../interfaces/tag.interface';

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
    ancestors: [{ type: Schema.Types.ObjectId, ref: 'Tag', index: true }],
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

TagSchema.set('toJSON', {
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

TagSchema.pre<Tag>('save', async function(next: HookNextFunction) {
  /**
   * Generate uuid
   */
  if (this.isNew) {
    this.uuid = uuidv4();
  }
  next();
});

// Always attach `populate()` to `find()` calls
TagSchema.pre<Tag>('find', function() {
  this.populate({ path: 'parent', select: 'id uuid name' });
});

TagSchema.plugin(uniqueValidator);
