import { Router, Response } from 'express';
import { Connection } from '../models/Connection.ts';
import { User } from '../models/User.ts';
import { Message } from '../models/Message.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get all connection records for current user
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentId = req.userId;

    const connections = await Connection.find({
      $or: [{ requester: currentId }, { recipient: currentId }],
    })
      .populate('requester', 'name username avatar bio location hobbies')
      .populate('recipient', 'name username avatar bio location hobbies')
      .sort({ updatedAt: -1 });

    const accepted: any[] = [];
    const incoming: any[] = [];
    const outgoing: any[] = [];

    for (const c of connections) {
      const isRequester = (c.requester as any)._id.toString() === currentId;
      const partner = isRequester ? c.recipient : c.requester;

      const formatted = {
        _id: c._id,
        status: c.status,
        partner,
        introMessage: c.introMessage,
        hobbyContext: c.hobbyContext,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };

      if (c.status === 'accepted') {
        accepted.push(formatted);
      } else if (c.status === 'pending') {
        if (isRequester) {
          outgoing.push(formatted);
        } else {
          incoming.push(formatted);
        }
      }
    }

    res.json({
      accepted,
      incoming,
      outgoing,
      totalConnected: accepted.length,
      totalPendingIncoming: incoming.length,
    });
  } catch (error: any) {
    console.error('Fetch connections error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send connection request
router.post('/request', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId, introMessage, hobbyContext } = req.body;

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user ID is required' });
      return;
    }

    if (targetUserId === req.userId) {
      res.status(400).json({ error: 'You cannot connect with yourself' });
      return;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found in MongoDB' });
      return;
    }

    // Check if connection already exists
    const existing = await Connection.findOne({
      $or: [
        { requester: req.userId, recipient: targetUserId },
        { requester: targetUserId, recipient: req.userId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        res.status(400).json({ error: 'You are already connected with this user' });
        return;
      }
      if (existing.status === 'pending') {
        res.status(400).json({ error: 'A connection request is already pending between you' });
        return;
      }
      // If previously declined, allow re-requesting
      existing.status = 'pending';
      existing.requester = req.userId as any;
      existing.recipient = targetUserId as any;
      existing.introMessage = introMessage || `Hi! I saw we both enjoy ${hobbyContext || 'hobbies'} and would love to connect.`;
      existing.hobbyContext = hobbyContext;
      await existing.save();

      res.json({
        message: 'Connection request sent successfully and updated in MongoDB',
        connection: existing,
      });
      return;
    }

    const newConnection = new Connection({
      requester: req.userId,
      recipient: targetUserId,
      status: 'pending',
      introMessage: introMessage || `Hi! I saw we both enjoy ${hobbyContext || 'similar hobbies'} and would love to connect!`,
      hobbyContext: hobbyContext || undefined,
    });

    await newConnection.save();

    // If introMessage provided, create initial message in Message collection as well!
    if (introMessage && introMessage.trim().length > 0) {
      await Message.create({
        sender: req.userId,
        recipient: targetUserId,
        content: introMessage.trim(),
        hobbyContext: hobbyContext || 'Connection Request Intro',
        read: false,
      });
    }

    res.status(201).json({
      message: 'Connection request sent and stored in MongoDB',
      connection: newConnection,
    });
  } catch (error: any) {
    console.error('Send connection request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Respond to connection request (accept or decline)
router.put('/:id/respond', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    if (!action || !['accept', 'decline'].includes(action)) {
      res.status(400).json({ error: 'Action must be "accept" or "decline"' });
      return;
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      res.status(404).json({ error: 'Connection record not found' });
      return;
    }

    // Only recipient can respond to pending request
    if (connection.recipient.toString() !== req.userId) {
      res.status(403).json({ error: 'You are not authorized to respond to this request' });
      return;
    }

    connection.status = action === 'accept' ? 'accepted' : 'declined';
    await connection.save();

    // If accepted, send automated welcome message
    if (action === 'accept') {
      await Message.create({
        sender: req.userId,
        recipient: connection.requester,
        content: `Hi! I accepted your connection request. Great to connect over ${connection.hobbyContext || 'our shared interests'}!`,
        hobbyContext: connection.hobbyContext,
        read: false,
      });
    }

    res.json({
      message: `Connection request ${action}ed and persisted in MongoDB`,
      connection,
    });
  } catch (error: any) {
    console.error('Connection respond error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove connection
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }

    const isMember =
      connection.requester.toString() === req.userId || connection.recipient.toString() === req.userId;

    if (!isMember) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    await Connection.findByIdAndDelete(connection._id);

    res.json({ message: 'Connection removed from MongoDB successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
