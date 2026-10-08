import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.ts';
import { Hobby } from '../models/Hobby.ts';
import { requireAuth, AuthRequest, JWT_SECRET } from '../middleware/auth.ts';

const router = Router();

// Helper to sign JWT
function signToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Register
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const { name, username, email, password, avatar, bio, location, hobbies } = req.body;

    if (!name || !username || !email || !password) {
      res.status(400).json({ error: 'Name, username, email, and password are required' });
      return;
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existing) {
      if (existing.email === cleanEmail) {
        res.status(400).json({ error: 'Email is already registered' });
        return;
      }
      res.status(400).json({ error: 'Username is already taken' });
      return;
    }

    const newUser = new User({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      avatar:
        avatar ||
        `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80`,
      bio: bio || 'Craft enthusiast focused on skill exchanges and collaborative practice.',
      location: location || 'Remote',
      hobbies: hobbies || [],
    });

    await newUser.save();

    // Update memberCounts for chosen hobbies
    if (newUser.hobbies && newUser.hobbies.length > 0) {
      const hobbyIds = newUser.hobbies.map((h) => h.hobbyId);
      await Hobby.updateMany({ _id: { $in: hobbyIds } }, { $inc: { memberCount: 1 } });
    }

    const token = signToken(newUser._id.toString());
    const userSafe = await User.findById(newUser._id).select('-password');

    res.status(201).json({
      message: 'User registered successfully in MongoDB',
      token,
      user: userSafe,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const { login, password } = req.body; // login can be email or username
    if (!login || !password) {
      res.status(400).json({ error: 'Please provide email/username and password' });
      return;
    }

    const cleanLogin = login.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: cleanLogin }, { username: cleanLogin }],
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found in MongoDB.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
      return;
    }

    const token = signToken(user._id.toString());
    const userSafe = await User.findById(user._id).select('-password');

    res.json({
      message: 'Logged in successfully',
      token,
      user: userSafe,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Demo switch login (Instant login as demo user for evaluators)
router.post('/demo-login/:username', async (req, res: Response): Promise<void> => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username }).select('-password');

    if (!user) {
      res.status(404).json({ error: `Demo user ${username} not found` });
      return;
    }

    const token = signToken(user._id.toString());
    res.json({
      message: `Switched to demo account: @${user.username}`,
      token,
      user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, avatar, bio, location, availability, hobbies, matchPreferences } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (availability !== undefined) user.availability = availability;
    if (matchPreferences) user.matchPreferences = matchPreferences;

    if (hobbies && Array.isArray(hobbies)) {
      user.hobbies = hobbies;
    }

    await user.save();
    const updated = await User.findById(user._id).select('-password');

    res.json({
      message: 'Profile updated in MongoDB successfully',
      user: updated,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
