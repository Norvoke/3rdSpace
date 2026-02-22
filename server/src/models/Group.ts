import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  slug: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name:        { type: String, required: true, trim: true, maxlength: 80 },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 500 },
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members:     [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPrivate:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

GroupSchema.index({ slug: 1 });
GroupSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IGroup>('Group', GroupSchema);
