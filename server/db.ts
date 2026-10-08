import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

let mongodInstance: MongoMemoryServer | null = null;
let currentSource: 'external' | 'embedded' = 'embedded';
let externalConnectionError: string | null = null;
let activeUri: string = '';

export async function connectDB(customUriToTry?: string): Promise<{ uri: string; source: 'external' | 'embedded'; error?: string | null }> {
  const uriToTest = customUriToTry || process.env.MONGODB_URI;

  if (uriToTest && uriToTest.trim() !== '') {
    try {
      console.log('Attempting connection to external MongoDB instance...');
      // Clean up any existing connection first
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }

      await mongoose.connect(uriToTest.trim(), {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });

      console.log('Connected to external MongoDB successfully.');
      currentSource = 'external';
      externalConnectionError = null;
      activeUri = uriToTest.trim();
      return { uri: activeUri, source: 'external' };
    } catch (err: any) {
      externalConnectionError = err?.message || 'External MongoDB connection failed';
      console.log(`External MONGODB_URI rejected (${externalConnectionError}). Cleanly resetting connection pool...`);
      try {
        await mongoose.disconnect();
      } catch {
        // ignore
      }
    }
  }

  // Ensure persistent data directory if possible
  const dbDir = path.resolve(process.cwd(), '.mongodb_data');
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      // Ignore
    }
  }

  // If mongodInstance is already created and running, reuse or recreate
  if (!mongodInstance) {
    try {
      console.log('Starting local persistent MongoDB engine...');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'hobbyconnect_db',
          dbPath: fs.existsSync(dbDir) ? dbDir : undefined,
        },
      });
    } catch (error) {
      console.log('Persistent dbPath in use, initializing standalone MongoDB instance...');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'hobbyconnect_db',
        },
      });
    }
  }

  try {
    const uri = mongodInstance.getUri();
    activeUri = uri;
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }

    await mongoose.connect(uri, {
      dbName: 'hobbyconnect_db',
    });
    console.log('Connected to MongoDB (hobbyconnect_db) successfully.');
    currentSource = 'embedded';
    return { uri, source: 'embedded', error: externalConnectionError };
  } catch (embeddedErr: any) {
    console.log('Retrying clean MongoDB instance...', embeddedErr?.message);
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'hobbyconnect_db',
      },
    });
    const uri = mongodInstance.getUri();
    activeUri = uri;
    await mongoose.connect(uri, {
      dbName: 'hobbyconnect_db',
    });
    currentSource = 'embedded';
    return { uri, source: 'embedded', error: externalConnectionError };
  }
}

export function getDBConnectionState(): {
  isConnected: boolean;
  readyState: number;
  host?: string;
  name?: string;
  source: 'external' | 'embedded';
  externalError: string | null;
} {
  const readyState = mongoose.connection.readyState;
  return {
    isConnected: readyState === 1,
    readyState,
    host: mongoose.connection.host || '127.0.0.1',
    name: mongoose.connection.name || 'hobbyconnect_db',
    source: currentSource,
    externalError: externalConnectionError,
  };
}
