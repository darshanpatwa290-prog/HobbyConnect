import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserHobby {
  hobbyId: mongoose.Types.ObjectId;
  hobbyName: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mentor';
  yearsExperience?: number;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  bio: string;
  location: string;
  hobbies: IUserHobby[];
  availability: string; // e.g. "Weekends & Evenings"
  matchPreferences?: {
    seekingSkillLevel?: string[];
    localOnly?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserHobbySchema = new Schema<IUserHobby>({
  hobbyId: { type: Schema.Types.ObjectId, ref: 'Hobby', required: true },
  hobbyName: { type: String, required: true },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Mentor'],
    default: 'Intermediate',
  },
  yearsExperience: { type: Number, default: 1 },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    bio: { type: String, default: 'Exploring new hobbies and connecting with like-minded creators!' },
    location: { type: String, default: 'San Francisco, CA' },
    hobbies: [UserHobbySchema],
    availability: { type: String, default: 'Weekends & Evenings' },
    matchPreferences: {
      seekingSkillLevel: { type: [String], default: [] },
      localOnly: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
