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
  targetProfile?: mongoose.Types.ObjectId; // Wall post on another user's profile
  visibility: 'public' | 'friends';
  comments: IComment[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 5000 },
    imageUrl: { type: String },
    targetProfile: { type: Schema.Types.ObjectId, ref: 'User' },
    visibility: { type: String, enum: ['public', 'friends'], default: 'friends' },
    comments: [CommentSchema],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Chronological index — NO algorithmic ranking, ever
PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ targetProfile: 1, createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema);
