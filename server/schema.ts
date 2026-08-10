import { pgTable, text, integer, real, boolean, timestamp, primaryKey, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("client"),
  status: text("status").notNull().default("active"),
  emailVerified: integer("email_verified").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  landlordId: text("landlord_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  county: text("county").notNull(),
  town: text("town").notNull(),
  estate: text("estate"),
  address: text("address"),
  lat: real("lat"),
  lng: real("lng"),
  type: text("type").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  price: real("price").notNull(),
  deposit: real("deposit"),
  availability: text("availability").notNull(),
  status: text("status").notNull().default("pending"),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  views: integer("views").default(0),
  inquiries: integer("inquiries").default(0),
  whatsappClicks: integer("whatsapp_clicks").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propertyAmenities = pgTable("property_amenities", {
  propertyId: text("property_id").notNull().references(() => properties.id),
  amenity: text("amenity").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.propertyId, t.amenity] }),
}));

export const propertyImages = pgTable("property_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  propertyId: text("property_id").notNull().references(() => properties.id),
  imageUrl: text("image_url").notNull(),
});

export const favorites = pgTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  propertyId: text("property_id").notNull().references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.userId, t.propertyId),
}));

export const inquiries = pgTable("inquiries", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull().references(() => properties.id),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
