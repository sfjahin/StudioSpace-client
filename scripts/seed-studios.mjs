/**
 * Seed one studio for each of the five categories featured on the home page:
 * Photo Studio, Film Stage, Podcast Lounge, Music Suite and Workshop.
 *
 * Usage: npm run seed
 *
 * Idempotent: re-running updates the same five listings instead of creating
 * duplicates. Reads MONGODB_URI / MONGODB_DB from the environment or `.env`.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";

function loadEnvFile() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    // Strip a trailing inline comment (` # ...`) but keep `#` inside URLs/values.
    value = value.replace(/\s+#.*$/, "").replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] = value;
  }
}

loadEnvFile();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env or export it first.");
  process.exit(1);
}

const owner = {
  name: process.env.SEED_OWNER_NAME ?? "Maya Chan",
  email: process.env.SEED_OWNER_EMAIL ?? "wagajer251@en2ch.com",
};

const studios = [
  {
    title: "Golden Hour Photo Loft",
    category: "Photo Studio",
    hourlyRate: 85,
    securityDeposit: 250,
    maxCapacity: 12,
    address: "25 Wythe Ave, Brooklyn, NY",
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    amenities: [
      "Natural light",
      "Lighting equipment",
      "Fast Wi-Fi",
      "Props & furniture",
      "Restroom",
      "Step-free access",
    ],
    overview:
      "A sun-drenched loft with 14-foot windows, white cyclorama walls and a full strobe kit. The open floor plan fits editorial shoots, lookbooks and small film crews, with a freight elevator for easy load-in.",
  },
  {
    title: "Stage 7 Film Stage",
    category: "Film Stage",
    hourlyRate: 240,
    securityDeposit: 1200,
    maxCapacity: 40,
    address: "1200 Seward St, Los Angeles, CA",
    imageUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    amenities: [
      "Soundproofing",
      "Freight elevator",
      "Lighting equipment",
      "Air conditioning",
      "Parking",
      "Restroom",
    ],
    overview:
      "A 4,000 sq ft soundstage with a 22-foot grid, silent HVAC and a pre-lit green screen. Ideal for commercials, music videos and multi-camera shoots, with a separate green room and drive-in access.",
  },
  {
    title: "The Mic Room",
    category: "Podcast Lounge",
    hourlyRate: 55,
    securityDeposit: 150,
    maxCapacity: 6,
    address: "901 E 6th St, Austin, TX",
    imageUrl:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80",
    amenities: [
      "Soundproofing",
      "Fast Wi-Fi",
      "Air conditioning",
      "Bluetooth speaker",
      "Kitchenette",
      "Restroom",
    ],
    overview:
      "A treated podcast lounge with four broadcast mics, headphones and a four-camera rig ready to record. The lounge seats six guests comfortably and the kitchenette keeps the conversation going between takes.",
  },
  {
    title: "Frequency Music Suite",
    category: "Music Suite",
    hourlyRate: 95,
    securityDeposit: 300,
    maxCapacity: 10,
    address: "16 Music Sq E, Nashville, TN",
    imageUrl:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1200&q=80",
    amenities: [
      "Soundproofing",
      "Bluetooth speaker",
      "Air conditioning",
      "Kitchenette",
      "Restroom",
      "Fast Wi-Fi",
    ],
    overview:
      "A warm, wood-panelled writing and rehearsal suite with a grand piano, drum kit and a vocal booth. Perfect for tracking sessions, songwriting camps and small listening events, with backline included.",
  },
  {
    title: "The Maker's Table",
    category: "Workshop",
    hourlyRate: 65,
    securityDeposit: 200,
    maxCapacity: 18,
    address: "811 SE Stark St, Portland, OR",
    imageUrl:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    amenities: [
      "Fast Wi-Fi",
      "Props & furniture",
      "Kitchenette",
      "Restroom",
      "Step-free access",
      "Parking",
    ],
    overview:
      "A bright, flexible workshop room with communal tables, a sink and a projector wall. Set up for ceramics, printmaking, team offsites or hands-on classes for up to eighteen makers, with parking on site.",
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "studiospace");
  const collection = db.collection("studios");

  const now = new Date();
  let created = 0;
  let updated = 0;

  for (const [index, studio] of studios.entries()) {
    const [city, ...rest] = studio.address.split(",");
    const area = rest.join(",").trim();

    const result = await collection.updateOne(
      { title: studio.title, ownerEmail: owner.email },
      {
        $set: {
          ...studio,
          ownerName: owner.name,
          ownerEmail: owner.email,
          // Compatibility fields used by the older StudioSpace API shape.
          imageUrls: [studio.imageUrl],
          description: studio.overview,
          price: studio.hourlyRate,
          capacity: studio.maxCapacity,
          location: { city: city.trim(), area },
          isPublished: true,
          isFeatured: true,
          rating: 4.8,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: new Date(now.getTime() - index * 60_000),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount) created += 1;
    else updated += 1;
  }

  const total = await collection.countDocuments();
  console.log(`Seeded ${studios.length} studios for ${owner.email}: ${created} created, ${updated} updated.`);
  console.log(`Total studios in "${db.databaseName}": ${total}`);
} finally {
  await client.close();
}
