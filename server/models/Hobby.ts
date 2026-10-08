import mongoose, { Schema, Document } from 'mongoose';

export type HobbyCategory =
  | 'Sports & Outdoors'
  | 'Creative & Arts'
  | 'Tech & Gaming'
  | 'Music & Audio'
  | 'Culinary & Food'
  | 'Learning & Science'
  | 'Lifestyle & Wellness';

export interface IHobby extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: HobbyCategory;
  description: string;
  icon: string;
  tags: string[];
  bannerImage: string;
  memberCount: number;
  creatorId?: mongoose.Types.ObjectId;
  difficulty: 'All Levels' | 'Beginner Friendly' | 'Intermediate' | 'Advanced';
  createdAt: Date;
  updatedAt: Date;
}

const HobbySchema = new Schema<IHobby>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Sports & Outdoors',
        'Creative & Arts',
        'Tech & Gaming',
        'Music & Audio',
        'Culinary & Food',
        'Learning & Science',
        'Lifestyle & Wellness',
      ],
    },
    description: { type: String, required: true },
    icon: { type: String, default: 'Sparkles' },
    tags: [{ type: String, trim: true }],
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    },
    memberCount: { type: Number, default: 0 },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    difficulty: {
      type: String,
      enum: ['All Levels', 'Beginner Friendly', 'Intermediate', 'Advanced'],
      default: 'All Levels',
    },
  },
  { timestamps: true }
);

export const Hobby = mongoose.model<IHobby>('Hobby', HobbySchema);
