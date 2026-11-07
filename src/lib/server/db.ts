import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to your .env file.");
}

const globalForMongo = globalThis as unknown as { studioSpaceMongo?: MongoClient };

/** Shared client so hot reloads don't leak connections. */
export const mongoClient = globalForMongo.studioSpaceMongo ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.studioSpaceMongo = mongoClient;
}

export const db = mongoClient.db(process.env.MONGODB_DB ?? "studiospace");

export function studiosCollection() {
  return db.collection("studios");
}

export function bookingsCollection() {
  return db.collection("bookings");
}
