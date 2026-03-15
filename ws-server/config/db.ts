import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

let client: MongoClient;
export let db;

export async function initMongo() {

  client = new MongoClient(MONGODB_URI);

  await client.connect();

  db = client.db("whiteboard_collab");

  console.log("[WS Server] Connected to MongoDB");

}

export async function closeMongo() {

  if (client) {
    await client.close();
  }

}