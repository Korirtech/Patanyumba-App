import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "patanyumba.db");

// Initialize database
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables if they don't exist
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL
    )
  `);

  // Properties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      landlordId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      county TEXT NOT NULL,
      town TEXT NOT NULL,
      estate TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      type TEXT NOT NULL,
      bedrooms INTEGER,
      bathrooms INTEGER,
      price REAL NOT NULL,
      deposit REAL,
      availability TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      verified BOOLEAN DEFAULT 0,
      views INTEGER DEFAULT 0,
      inquiries INTEGER DEFAULT 0,
      whatsappClicks INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (landlordId) REFERENCES users(id)
    )
  `);

  // Property amenities (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS property_amenities (
      propertyId TEXT NOT NULL,
      amenity TEXT NOT NULL,
      PRIMARY KEY (propertyId, amenity),
      FOREIGN KEY (propertyId) REFERENCES properties(id)
    )
  `);

  // Property images
  db.exec(`
    CREATE TABLE IF NOT EXISTS property_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      propertyId TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      FOREIGN KEY (propertyId) REFERENCES properties(id)
    )
  `);

  // Favorites table
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      propertyId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (propertyId) REFERENCES properties(id),
      UNIQUE(userId, propertyId)
    )
  `);

  // Inquiries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      propertyId TEXT NOT NULL,
      userId TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (propertyId) REFERENCES properties(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
}

// User queries
export const userQueries = {
  create: (user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    status: string;
    createdAt: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, phone, password, role, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      user.id,
      user.name,
      user.email,
      user.phone,
      user.password,
      user.role,
      user.status,
      user.createdAt
    );
  },

  findByEmail: (email: string) => {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email);
  },

  findById: (id: string) => {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    return stmt.get(id);
  },

  getAll: () => {
    const stmt = db.prepare("SELECT * FROM users");
    return stmt.all();
  },

  update: (id: string, data: Record<string, any>) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const stmt = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
    return stmt.run(...values, id);
  },

  delete: (id: string) => {
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    return stmt.run(id);
  },
};

// Property queries
export const propertyQueries = {
  create: (property: {
    id: string;
    landlordId: string;
    title: string;
    description: string;
    county: string;
    town: string;
    estate: string;
    address: string;
    lat: number;
    lng: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    deposit: number;
    availability: string;
    status: string;
    verified: boolean;
    createdAt: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO properties 
      (id, landlordId, title, description, county, town, estate, address, lat, lng, 
       type, bedrooms, bathrooms, price, deposit, availability, status, verified, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      property.id,
      property.landlordId,
      property.title,
      property.description,
      property.county,
      property.town,
      property.estate,
      property.address,
      property.lat,
      property.lng,
      property.type,
      property.bedrooms,
      property.bathrooms,
      property.price,
      property.deposit,
      property.availability,
      property.status,
      property.verified ? 1 : 0,
      property.createdAt
    );
  },

  findById: (id: string) => {
    const stmt = db.prepare("SELECT * FROM properties WHERE id = ?");
    return stmt.get(id);
  },

  getAll: () => {
    const stmt = db.prepare("SELECT * FROM properties");
    return stmt.all();
  },

  getByLandlord: (landlordId: string) => {
    const stmt = db.prepare("SELECT * FROM properties WHERE landlordId = ?");
    return stmt.all(landlordId);
  },

  update: (id: string, data: Record<string, any>) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const stmt = db.prepare(`UPDATE properties SET ${setClause} WHERE id = ?`);
    return stmt.run(...values, id);
  },

  delete: (id: string) => {
    const stmt = db.prepare("DELETE FROM properties WHERE id = ?");
    return stmt.run(id);
  },
};
