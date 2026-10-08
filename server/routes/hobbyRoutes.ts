import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Hobby } from '../models/Hobby.ts';
import { User } from '../models/User.ts';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get all hobbies with search, category filtering
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, tag } = req.query;
    const filter: any = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (tag && typeof tag === 'string') {
      filter.tags = tag;
    }

    const hobbies = await Hobby.find(filter).sort({ memberCount: -1, name: 1 });

    // Check which ones the current logged-in user has joined
    let userHobbyIds: string[] = [];
    if (req.user) {
      userHobbyIds = req.user.hobbies.map((h) => h.hobbyId.toString());
    }

    const hobbiesWithJoinStatus = hobbies.map((h) => ({
      ...h.toObject(),
      isJoined: userHobbyIds.includes(h._id.toString()),
    }));

    res.json({ hobbies: hobbiesWithJoinStatus });
  } catch (error: any) {
    console.error('Fetch hobbies error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new hobby
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, description, tags, icon, bannerImage, difficulty } = req.body;

    if (!name || !category || !description) {
      res.status(400).json({ error: 'Name, category, and description are required' });
      return;
    }

    const existing = await Hobby.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      res.status(400).json({ error: `A hobby named "${name}" already exists` });
      return;
    }

    const newHobby = new Hobby({
      name: name.trim(),
      category,
      description: description.trim(),
      tags: tags || [],
      icon: icon || 'Sparkles',
      bannerImage:
        bannerImage ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      difficulty: difficulty || 'All Levels',
      creatorId: req.userId,
      memberCount: 1,
    });

    await newHobby.save();

    // Automatically join creator to this hobby
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        hobbies: {
          hobbyId: newHobby._id,
          hobbyName: newHobby.name,
          skillLevel: 'Intermediate',
          yearsExperience: 1,
        },
      },
    });

    res.status(201).json({
      message: 'Hobby created and persisted in MongoDB successfully',
      hobby: newHobby,
    });
  } catch (error: any) {
    console.error('Create hobby error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single hobby details with active members
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hobby = await Hobby.findById(req.params.id);
    if (!hobby) {
      res.status(404).json({ error: 'Hobby not found' });
      return;
    }

    // Find users who have this hobby
    const members = await User.find({ 'hobbies.hobbyId': hobby._id })
      .select('name username avatar bio location hobbies')
      .limit(12);

    let isJoined = false;
    if (req.user) {
      isJoined = req.user.hobbies.some((h) => h.hobbyId.toString() === hobby._id.toString());
    }

    res.json({
      hobby: {
        ...hobby.toObject(),
        isJoined,
      },
      members,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join hobby
router.post('/:id/join', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hobby = await Hobby.findById(req.params.id);
    if (!hobby) {
      res.status(404).json({ error: 'Hobby not found in MongoDB' });
      return;
    }

    const { skillLevel = 'Intermediate', yearsExperience = 1 } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const alreadyJoined = user.hobbies.some((h) => h.hobbyId.toString() === hobby._id.toString());
    if (alreadyJoined) {
      res.status(400).json({ error: 'You are already a member of this hobby' });
      return;
    }

    user.hobbies.push({
      hobbyId: hobby._id as any,
      hobbyName: hobby.name,
      skillLevel,
      yearsExperience,
    });

    await user.save();
    hobby.memberCount = (hobby.memberCount || 0) + 1;
    await hobby.save();

    res.json({
      message: `Joined ${hobby.name}! Persisted in MongoDB.`,
      userHobbies: user.hobbies,
      memberCount: hobby.memberCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Leave hobby
router.post('/:id/leave', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hobby = await Hobby.findById(req.params.id);
    if (!hobby) {
      res.status(404).json({ error: 'Hobby not found' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.hobbies = user.hobbies.filter((h) => h.hobbyId.toString() !== hobby._id.toString());
    await user.save();

    hobby.memberCount = Math.max(0, (hobby.memberCount || 1) - 1);
    await hobby.save();

    res.json({
      message: `Left ${hobby.name}`,
      userHobbies: user.hobbies,
      memberCount: hobby.memberCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
