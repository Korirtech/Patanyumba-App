import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/schema.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlitePath = path.join(__dirname, "..", "data", "patanyumba.db");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required.");
  process.exit(1);
}

async function migrate() {
  console.log("🚀 Starting migration from SQLite to Supabase...");
  
  const sqlite = new Database(sqlitePath);
  const client = postgres(DATABASE_URL);
  const pg = drizzle(client, { schema });

  try {
    // 1. Migrate Users
    const sqliteUsers = sqlite.prepare("SELECT * FROM users").all();
    console.log(`- Found ${sqliteUsers.length} users in SQLite.`);
    for (const user of sqliteUsers as any[]) {
      await pg.insert(schema.users).values({
        ...user,
        createdAt: new Date(user.createdAt),
      }).onConflictDoNothing();
    }
    console.log("✅ Users migrated.");

    // 2. Migrate Properties
    const sqliteProperties = sqlite.prepare("SELECT * FROM properties").all();
    console.log(`- Found ${sqliteProperties.length} properties in SQLite.`);
    for (const prop of sqliteProperties as any[]) {
      await pg.insert(schema.properties).values({
        ...prop,
        verified: Boolean(prop.verified),
        featured: Boolean(prop.featured),
        createdAt: new Date(prop.createdAt),
      }).onConflictDoNothing();
    }
    console.log("✅ Properties migrated.");

    // 3. Migrate Amenities
    const sqliteAmenities = sqlite.prepare("SELECT * FROM property_amenities").all();
    for (const amenity of sqliteAmenities as any[]) {
      await pg.insert(schema.propertyAmenities).values(amenity).onConflictDoNothing();
    }
    console.log("✅ Amenities migrated.");

    // 4. Migrate Images
    const sqliteImages = sqlite.prepare("SELECT * FROM property_images").all();
    for (const img of sqliteImages as any[]) {
      await pg.insert(schema.propertyImages).values(img).onConflictDoNothing();
    }
    console.log("✅ Images migrated.");

    console.log("🎉 Migration successfully completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await client.end();
    sqlite.close();
  }
}

migrate();
