import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message.ts';
import { User } from '../models/User.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get list of recent conversations
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentId = new mongoose.Types.ObjectId(req.userId);

    // Aggregate conversations grouped by the other user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentId }, { recipient: currentId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          sender: 1,
          recipient: 1,
          content: 1,
          hobbyContext: 1,
          read: 1,
          createdAt: 1,
          otherUserId: {
            $cond: [{ $eq: ['$sender', currentId] }, '$recipient', '$sender'],
          },
        },
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', currentId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    // Populate user info for each conversation
    const otherUserIds = conversations.map((c) => c._id);
    const users = await User.find({ _id: { $in: otherUserIds } }).select(
      'name username avatar bio location hobbies'
    );
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const formattedList = conversations
      .map((c) => {
        const user = userMap.get(c._id.toString());
        if (!user) return null;
        return {
          contact: user,
          lastMessage: {
            content: c.lastMessage.content,
            hobbyContext: c.lastMessage.hobbyContext,
            createdAt: c.lastMessage.createdAt,
            sender: c.lastMessage.sender,
          },
          unreadCount: c.unreadCount,
        };
      })
      .filter(Boolean);

    res.json({ conversations: formattedList });
  } catch (error: any) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get message history with a specific user
router.get('/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentId = req.userId;
    const targetUserId = req.params.userId;

    const targetUser = await User.findById(targetUserId).select(
      'name username avatar bio location hobbies'
    );

    if (!targetUser) {
      res.status(404).json({ error: 'User not found in MongoDB' });
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: currentId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentId },
      ],
    }).sort({ createdAt: 1 });

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: targetUserId, recipient: currentId, read: false },
      { $set: { read: true } }
    );

    res.json({
      targetUser,
      messages,
    });
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send message to a specific user
router.post('/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentId = req.userId;
    const targetUserId = req.params.userId;
    const { content, hobbyContext } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty' });
      return;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ error: 'Recipient user not found in MongoDB' });
      return;
    }

    const newMessage = new Message({
      sender: currentId,
      recipient: targetUserId,
      content: content.trim(),
      hobbyContext: hobbyContext || undefined,
      read: false,
    });

    await newMessage.save();

    res.status(201).json({
      message: 'Message delivered and persisted in MongoDB',
      data: newMessage,
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/:userId/read', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentId = req.userId;
    const targetUserId = req.params.userId;

    await Message.updateMany(
      { sender: targetUserId, recipient: currentId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
