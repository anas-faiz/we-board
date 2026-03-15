import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'whiteboard_collab';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

// Initialize collections and indexes
export async function initializeDatabase() {
  const db = await getDatabase();

  // Create collections if they don't exist
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  if (!collectionNames.includes('whiteboards')) {
    await db.createCollection('whiteboards');
    await db.collection('whiteboards').createIndex({ room_id: 1 }, { unique: true });
    await db.collection('whiteboards').createIndex({ created_at: 1 });
  }

  if (!collectionNames.includes('drawing_events')) {
    await db.createCollection('drawing_events');
    await db.collection('drawing_events').createIndex({ room_id: 1 });
    await db.collection('drawing_events').createIndex({ timestamp: 1 });
    await db.collection('drawing_events').createIndex({ room_id: 1, timestamp: 1 });
  }

  if (!collectionNames.includes('sessions')) {
    await db.createCollection('sessions');
    await db.collection('sessions').createIndex({ room_id: 1 });
    await db.collection('sessions').createIndex({ user_id: 1 });
    await db.collection('sessions').createIndex({ created_at: 1 }, { expireAfterSeconds: 86400 });
  }
}
