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
  customCSS?: string;      // Let users style their own profile
  customHTML?: string;     // Profile "About Me" raw HTML block
  headerImage?: string;
  bannerColor?: string;         // Banner background hex color (default when unset)
  bannerPattern?: string;       // Hero Patterns id tiled over the banner
  bannerPatternColor?: string;  // Foreground hex color for the tiled pattern
  bannerPatternScale?: number;  // Multiplier on the pattern's native tile size
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
    customCSS: { type: String, maxlength: 10000 },
    customHTML: { type: String, maxlength: 20000 },
    headerImage: { type: String },
    bannerColor: { type: String, match: /^#[0-9a-f]{6}$/i },
    bannerPattern: { type: String, maxlength: 60 },
    bannerPatternColor: { type: String, match: /^#[0-9a-f]{6}$/i },
    bannerPatternScale: { type: Number, min: 0.25, max: 4 },
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
