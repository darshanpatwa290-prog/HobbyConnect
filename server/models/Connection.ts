import mongoose, { Schema, Document } from 'mongoose';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface IConnection extends Document {
  _id: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: ConnectionStatus;
  introMessage?: string;
  hobbyContext?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    introMessage: { type: String, trim: true },
    hobbyContext: { type: String, trim: true },
  },
  { timestamps: true }
);

// Ensure a single connection record between two users (in either order)
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Connection = mongoose.model<IConnection>('Connection', ConnectionSchema);
