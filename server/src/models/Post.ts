import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  targetProfile?: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  isPublicWall: boolean;
  visibility: 'public' | 'friends' | 'private';
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    author:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content:   { type: String, required: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const PostSchema = new Schema<IPost>(
  {
    author:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content:       { type: String, required: true, maxlength: 5000 },
    imageUrl:      { type: String },
    targetProfile: { type: Schema.Types.ObjectId, ref: 'User' },
    group:         { type: Schema.Types.ObjectId, ref: 'Group' },
    isPublicWall:  { type: Boolean, default: false },
    visibility:    { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
    likes:         [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments:      [CommentSchema],
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ group: 1, createdAt: -1 });
PostSchema.index({ isPublicWall: 1, createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema);
