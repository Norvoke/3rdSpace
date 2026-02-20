import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  song?: string;           // MySpace signature: profile song URL
  customCSS?: string;      // Let users style their own profile
  customHTML?: string;     // Profile "About Me" raw HTML block
  headerImage?: string;
  mood?: string;
  interests?: string[];
  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_]+$/,
    },
    displayName: { type: String, required: true, trim: true, maxlength: 50 },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 100 },
    website: { type: String, maxlength: 200 },
    song: { type: String },             // Embed URL (SoundCloud, YouTube, etc.)
    customCSS: { type: String, maxlength: 10000 },
    customHTML: { type: String, maxlength: 20000 },
    headerImage: { type: String },
    mood: { type: String, maxlength: 100 },
    interests: [{ type: String }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ displayName: 'text', username: 'text', bio: 'text' });

export default mongoose.model<IUser>('User', UserSchema);
