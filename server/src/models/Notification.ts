import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'wall_post'
  | 'comment'
  | 'reply';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: NotificationType;
  post?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, enum: ['friend_request', 'friend_accepted', 'wall_post', 'comment', 'reply'], required: true },
    post:      { type: Schema.Types.ObjectId, ref: 'Post' },
    read:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
