import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.ts';
import { Connection } from '../models/Connection.ts';
import { optionalAuth, requireAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Helper to compute match score between two users
function computeMatchScore(
  currentUserHobbies: { hobbyName: string; skillLevel: string }[],
  targetUserHobbies: { hobbyName: string; skillLevel: string }[]
): { score: number; sharedHobbyNames: string[]; complementarySkills: string[] } {
  if (!currentUserHobbies.length || !targetUserHobbies.length) {
    return { score: 15, sharedHobbyNames: [], complementarySkills: [] };
  }

  const currentHobbyMap = new Map(currentUserHobbies.map((h) => [h.hobbyName.toLowerCase(), h.skillLevel]));
  const sharedHobbyNames: string[] = [];
  const complementarySkills: string[] = [];

  for (const th of targetUserHobbies) {
    const targetKey = th.hobbyName.toLowerCase();
    if (currentHobbyMap.has(targetKey)) {
      sharedHobbyNames.push(th.hobbyName);
      const mySkill = currentHobbyMap.get(targetKey);
      if (
        (mySkill === 'Beginner' && (th.skillLevel === 'Advanced' || th.skillLevel === 'Mentor')) ||
        ((mySkill === 'Advanced' || mySkill === 'Mentor') && th.skillLevel === 'Beginner') ||
        (mySkill === th.skillLevel)
      ) {
        complementarySkills.push(th.hobbyName);
      }
    }
  }

  // Calculate score (0-100)
  // Base on shared hobbies percentage + skill synergy
  const maxPossible = Math.max(currentUserHobbies.length, targetUserHobbies.length);
  const overlapRatio = sharedHobbyNames.length / maxPossible;
  let rawScore = Math.round(overlapRatio * 70);

  if (sharedHobbyNames.length > 0) {
    rawScore += 20; // bonus for having at least 1 shared hobby
  }
  if (complementarySkills.length > 0) {
    rawScore += Math.min(10, complementarySkills.length * 5);
  }

  const finalScore = Math.min(99, Math.max(25, rawScore));
  return { score: finalScore, sharedHobbyNames, complementarySkills };
}

// Discover users
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hobby, query, skillLevel, location } = req.query;
    const filter: any = {};

    // Exclude current user from discover list
    if (req.userId) {
      filter._id = { $ne: req.userId };
    }

    if (query && typeof query === 'string') {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { 'hobbies.hobbyName': { $regex: query, $options: 'i' } },
      ];
    }

    if (hobby && typeof hobby === 'string' && hobby !== 'All') {
      filter['hobbies.hobbyName'] = { $regex: new RegExp(`^${hobby}$`, 'i') };
    }

    if (skillLevel && typeof skillLevel === 'string' && skillLevel !== 'All') {
      filter['hobbies.skillLevel'] = skillLevel;
    }

    if (location && typeof location === 'string') {
      filter.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(filter).select('-password').limit(30);

    // If logged in, get connection status for each user
    let connectionMap = new Map<string, { status: string; connectionId: string; isRequester: boolean }>();
    if (req.userId) {
      const connections = await Connection.find({
        $or: [{ requester: req.userId }, { recipient: req.userId }],
      });

      for (const conn of connections) {
        const isRequester = conn.requester.toString() === req.userId;
        const otherId = isRequester ? conn.recipient.toString() : conn.requester.toString();
        connectionMap.set(otherId, {
          status: conn.status,
          connectionId: conn._id.toString(),
          isRequester,
        });
      }
    }

    const currentUserHobbies = req.user?.hobbies || [];

    const enrichedUsers = users.map((u) => {
      const uObj = u.toObject();
      const conn = connectionMap.get(u._id.toString());
      const matchResult = computeMatchScore(currentUserHobbies, u.hobbies || []);

      let relationship = 'none';
      if (conn) {
        if (conn.status === 'accepted') relationship = 'connected';
        else if (conn.status === 'pending') {
          relationship = conn.isRequester ? 'pending_outgoing' : 'pending_incoming';
        } else if (conn.status === 'declined') {
          relationship = 'declined';
        }
      }

      return {
        ...uObj,
        matchScore: matchResult.score,
        sharedHobbyNames: matchResult.sharedHobbyNames,
        complementarySkills: matchResult.complementarySkills,
        relationship,
        connectionId: conn ? conn.connectionId : null,
      };
    });

    // Sort by matchScore descending if logged in, else by createdAt
    if (req.userId) {
      enrichedUsers.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.json({ users: enrichedUsers });
  } catch (error: any) {
    console.error('Discover users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile by ID
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found in MongoDB' });
      return;
    }

    let relationship = 'none';
    let connectionId: string | null = null;
    let matchResult = { score: 0, sharedHobbyNames: [] as string[], complementarySkills: [] as string[] };

    if (req.userId && req.userId !== user._id.toString()) {
      const conn = await Connection.findOne({
        $or: [
          { requester: req.userId, recipient: user._id },
          { requester: user._id, recipient: req.userId },
        ],
      });

      if (conn) {
        connectionId = conn._id.toString();
        if (conn.status === 'accepted') relationship = 'connected';
        else if (conn.status === 'pending') {
          relationship = conn.requester.toString() === req.userId ? 'pending_outgoing' : 'pending_incoming';
        } else {
          relationship = conn.status;
        }
      }

      matchResult = computeMatchScore(req.user?.hobbies || [], user.hobbies || []);
    }

    res.json({
      user: {
        ...user.toObject(),
        relationship,
        connectionId,
        matchScore: matchResult.score,
        sharedHobbyNames: matchResult.sharedHobbyNames,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
