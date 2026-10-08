import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import { connectDB, getDBConnectionState } from './server/db.ts';
import { seedDatabaseIfEmpty } from './server/seed.ts';

import authRoutes from './server/routes/authRoutes.ts';
import userRoutes from './server/routes/userRoutes.ts';
import hobbyRoutes from './server/routes/hobbyRoutes.ts';
import connectionRoutes from './server/routes/connectionRoutes.ts';
import messageRoutes from './server/routes/messageRoutes.ts';
import postRoutes from './server/routes/postRoutes.ts';

import { User } from './server/models/User.ts';
import { Hobby } from './server/models/Hobby.ts';
import { Connection } from './server/models/Connection.ts';
import { Message } from './server/models/Message.ts';
import { Post } from './server/models/Post.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health & MERN Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  const dbState = getDBConnectionState();
  res.json({
    status: 'ok',
    server: 'Express.js + Node.js',
    database: 'MongoDB (Mongoose ODM)',
    dbConnected: dbState.isConnected,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/db/status', async (req, res) => {
  try {
    const dbState = getDBConnectionState();
    const [userCount, hobbyCount, connectionCount, messageCount, postCount] = await Promise.all([
      User.countDocuments(),
      Hobby.countDocuments(),
      Connection.countDocuments(),
      Message.countDocuments(),
      Post.countDocuments(),
    ]);

    const collections = mongoose.connection.db
      ? await mongoose.connection.db.listCollections().toArray()
      : [];

    res.json({
      success: true,
      stack: {
        database: 'MongoDB',
        odm: 'Mongoose',
        backend: 'Express.js',
        runtime: 'Node.js',
        frontend: 'React 19 + Vite',
      },
      connection: {
        isConnected: dbState.isConnected,
        readyState: dbState.readyState,
        databaseName: dbState.name || 'hobbyconnect_db',
        host: dbState.host || '127.0.0.1',
        source: dbState.source,
        externalError: dbState.externalError,
      },
      counts: {
        users: userCount,
        hobbies: hobbyCount,
        connections: connectionCount,
        messages: messageCount,
        posts: postCount,
      },
      collections: collections.map((c) => c.name),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic Reconnect to Atlas/Custom URI
app.post('/api/db/reconnect', async (req, res) => {
  const { uri } = req.body;
  if (!uri || typeof uri !== 'string') {
    res.status(400).json({ error: 'Please provide a valid MongoDB connection URI' });
    return;
  }

  try {
    const result = await connectDB(uri.trim());
    if (result.source === 'external') {
      await seedDatabaseIfEmpty();
      res.json({
        success: true,
        message: 'Successfully connected and authenticated with external MongoDB Atlas!',
        source: 'external',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to authenticate with provided MongoDB URI',
        source: 'embedded',
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount MERN API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hobbies', hobbyRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);

async function startServer() {
  try {
    // 1. Connect MongoDB
    console.log('Initializing MERN Stack MongoDB connection...');
    await connectDB();
    await seedDatabaseIfEmpty();

    // 2. Vite Middleware or Static Assets
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      console.log('Mounting Vite dev server middleware...');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true',
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('Serving production static build from dist/...');
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }

    // 3. Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 MERN Stack Application live on http://localhost:${PORT}`);
      console.log(`📦 Database: MongoDB (Mongoose)`);
      console.log(`⚡ Backend: Express.js (Node.js)`);
      console.log(`⚛️ Frontend: React 19 SPA`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
