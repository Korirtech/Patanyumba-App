import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const connectionString = process.env.DATABASE_URL || "";

if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL is not set in production");
}

// For local development, if DATABASE_URL is missing, we might want to warn
if (!connectionString) {
  console.warn("⚠ DATABASE_URL is not set. Database operations will fail.");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Helper to ensure database is ready (Supabase handles migrations usually, 
// but we can add a check or seed here)
export async function initializeDatabase() {
  try {
    // In a real Drizzle setup, you'd run migrations here or via CLI.
    // For this refactor, we assume the schema is applied to Supabase.
    await seedAdminUser();
    console.log("✓ Database connection verified and seeded.");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// User queries
export const userQueries = {
  create: async (user: any) => {
    return await db.insert(schema.users).values({
      ...user,
      createdAt: new Date(user.createdAt),
    }).returning();
  },

  findByEmail: async (email: string) => {
    const results = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return results[0];
  },

  findById: async (id: string) => {
    const results = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return results[0];
  },

  getAll: async () => {
    return await db.select().from(schema.users);
  },

  update: async (id: string, data: any, by: "id" | "email" = "id") => {
    const updateData = { ...data };
    if (updateData.createdAt) updateData.createdAt = new Date(updateData.createdAt);
    
    if (by === "email") {
      return await db.update(schema.users).set(updateData).where(eq(schema.users.email, id)).returning();
    }
    return await db.update(schema.users).set(updateData).where(eq(schema.users.id, id)).returning();
  },

  delete: async (id: string) => {
    return await db.delete(schema.users).where(eq(schema.users.id, id)).returning();
  },
};

// Property queries
export const propertyQueries = {
  create: async (property: any) => {
    return await db.insert(schema.properties).values({
      ...property,
      createdAt: new Date(property.createdAt),
    }).returning();
  },

  findById: async (id: string) => {
    const results = await db.select().from(schema.properties).where(eq(schema.properties.id, id)).limit(1);
    return results[0];
  },

  getAll: async () => {
    return await db.select().from(schema.properties);
  },

  getByLandlord: async (landlordId: string) => {
    return await db.select().from(schema.properties).where(eq(schema.properties.landlordId, landlordId));
  },

  update: async (id: string, data: any) => {
    const updateData = { ...data };
    if (updateData.createdAt) updateData.createdAt = new Date(updateData.createdAt);
    return await db.update(schema.properties).set(updateData).where(eq(schema.properties.id, id)).returning();
  },

  delete: async (id: string) => {
    return await db.delete(schema.properties).where(eq(schema.properties.id, id)).returning();
  },
};

// Seed default admin user
const ADMIN_EMAIL = "patanyumbaadmin@gmail.com";
const ADMIN_PASSWORD = "Pata123456";
const ADMIN_NAME = "Patanyumba Admin";
const ADMIN_PHONE = "0712345678";

async function seedAdminUser() {
  const existing = await userQueries.findByEmail(ADMIN_EMAIL);
  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db.insert(schema.users).values({
    id: randomUUID(),
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    phone: ADMIN_PHONE,
    password: hashedPassword,
    role: "admin",
    status: "active",
    emailVerified: 1,
    createdAt: new Date(),
  });
  console.log("✓ Default admin account seeded successfully.");
}
