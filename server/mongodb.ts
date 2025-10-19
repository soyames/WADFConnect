import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  await client.connect();
  const db = client.db("wadf");
  cachedDb = db;
  
  console.log("Connected to MongoDB (Firestore)");
  return db;
}

export async function getDatabase(): Promise<Db> {
  if (!cachedDb) {
    return await connectToDatabase();
  }
  return cachedDb;
}

export { client as mongoClient };
