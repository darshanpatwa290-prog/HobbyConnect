import { Router, Response } from 'express';
import { Post } from '../models/Post.ts';
import { User } from '../models/User.ts';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get posts
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hobby, tag } = req.query;
    const filter: any = {};

    if (hobby && hobby !== 'All') {
      filter.hobbyName = hobby;
    }

    if (tag) {
      filter.tags = tag;
    }

    const posts = await Post.find(filter)
      .populate('author', 'name username avatar location')
      .sort({ createdAt: -1 })
      .limit(25);

    const currentUserId = req.userId;

    const formattedPosts = posts.map((post) => {
      const p = post.toObject();
      return {
        ...p,
        likesCount: p.likes ? p.likes.length : 0,
        hasLiked: currentUserId ? p.likes?.some((id: any) => id.toString() === currentUserId) : false,
      };
    });

    res.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create post
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, hobbyName, hobbyId, imageUrl, tags } = req.body;

    if (!title || !content || !hobbyName) {
      res.status(400).json({ error: 'Title, content, and hobbyName are required' });
      return;
    }

    const newPost = new Post({
      author: req.userId,
      hobbyName: hobbyName.trim(),
      hobbyId: hobbyId || undefined,
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || undefined,
      tags: tags || [],
      likes: [],
      comments: [],
    });

    await newPost.save();
    const populated = await Post.findById(newPost._id).populate('author', 'name username avatar location');

    res.status(201).json({
      message: 'Post created and saved to MongoDB',
      post: populated,
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like / unlike post
router.post('/:id/like', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: 'Post not found in MongoDB' });
      return;
    }

    const currentId = req.userId as any;
    const existingIndex = post.likes.findIndex((id) => id.toString() === currentId);

    let hasLiked = false;
    if (existingIndex > -1) {
      post.likes.splice(existingIndex, 1);
      hasLiked = false;
    } else {
      post.likes.push(currentId);
      hasLiked = true;
    }

    await post.save();

    res.json({
      hasLiked,
      likesCount: post.likes.length,
      message: hasLiked ? 'Post liked' : 'Post unliked',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Comment on post
router.post('/:id/comment', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Comment content cannot be empty' });
      return;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: 'Post not found in MongoDB' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const comment = {
      author: user._id,
      authorName: user.name,
      authorAvatar: user.avatar,
      content: content.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment as any);
    await post.save();

    res.status(201).json({
      message: 'Comment added and saved to MongoDB',
      comments: post.comments,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
