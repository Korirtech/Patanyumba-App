import { randomUUID } from "node:crypto";
import express, { Request, Response } from "express";
import { userQueries, propertyQueries, db } from "./db.js";
import { requireRole, authenticateToken } from "./jwt.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Helper – strip password from user records
// ---------------------------------------------------------------------------

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status: string;
  createdAt: string;
}

function sanitizeUser(user: UserRecord) {
  const { password, ...rest } = user;
  return rest;
}

// ---------------------------------------------------------------------------
// Helper – hydrate property with images and amenities from related tables
// ---------------------------------------------------------------------------

interface PropertyRecord {
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
  verified: number;
  featured: number;
  views: number;
  inquiries: number;
  whatsappClicks: number;
  createdAt: string;
}

function hydrateProperty(p: PropertyRecord) {
  // Fetch images for this property
  const images = db
    .prepare("SELECT imageUrl FROM property_images WHERE propertyId = ? ORDER BY id")
    .all(p.id) as { imageUrl: string }[];

  // Fetch amenities for this property
  const amenities = db
    .prepare("SELECT amenity FROM property_amenities WHERE propertyId = ?")
    .all(p.id) as { amenity: string }[];

  return {
    ...p,
    images: images.map((img) => img.imageUrl),
    amenities: amenities.map((a) => a.amenity),
    verified: Boolean(p.verified),
    featured: Boolean(p.featured ?? 0),
  };
}

function normalizeProperty(p: PropertyRecord) {
  return {
    ...p,
    verified: Boolean(p.verified),
    featured: Boolean(p.featured ?? 0),
  };
}

// ---------------------------------------------------------------------------
// PUBLIC: GET /api/admin/properties/featured – list featured approved properties
// (no auth required – used by the public Home page)
// ---------------------------------------------------------------------------

router.get("/properties/featured", (_req: Request, res: Response) => {
  try {
    const properties = (propertyQueries.getAll() as PropertyRecord[])
      .filter((p) => p.status === "approved" && Boolean(p.featured) && p.availability !== "Rented")
      .map(hydrateProperty);
    return res.status(200).json({ properties });
  } catch (error) {
    console.error("Get featured properties error:", error);
    return res.status(500).json({ error: "Failed to fetch featured properties" });
  }
});

// ---------------------------------------------------------------------------
// PUBLIC: GET /api/admin/properties/all – list all approved properties
// (no auth required – used by the public Properties page)
// ---------------------------------------------------------------------------

router.get("/properties/all", (_req: Request, res: Response) => {
  try {
    const properties = (propertyQueries.getAll() as PropertyRecord[])
      .filter((p) => p.status === "approved")
      .map(hydrateProperty);
    return res.status(200).json({ properties });
  } catch (error) {
    console.error("Get all properties error:", error);
    return res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// ---------------------------------------------------------------------------
// PUBLIC: GET /api/admin/properties/detail/:id – get property by ID
// (no auth required – used by the public Property Detail page)
// ---------------------------------------------------------------------------

router.get("/properties/detail/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const property = propertyQueries.findById(id) as PropertyRecord | undefined;
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    return res.status(200).json({ property: hydrateProperty(property) });
  } catch (error) {
    console.error("Get property detail error:", error);
    return res.status(500).json({ error: "Failed to fetch property detail" });
  }
});

// ---------------------------------------------------------------------------
// PROTECTED: POST /api/admin/properties – landlord/admin adds a property
// (requires auth)
// ---------------------------------------------------------------------------

router.post("/properties", authenticateToken, (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      county,
      town,
      estate,
      address,
      lat,
      lng,
      type,
      bedrooms,
      bathrooms,
      price,
      deposit,
      amenities,
      images,
    } = req.body;

    if (!title || !county || !town || !type || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProperty = {
      id: randomUUID(),
      landlordId: req.user!.userId,
      title,
      description,
      county,
      town,
      estate,
      address,
      lat: lat || 0,
      lng: lng || 0,
      type,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      price: Number(price),
      deposit: Number(deposit || 0),
      availability: "Available",
      status: "pending",
      verified: false,
      createdAt: new Date().toISOString(),
    };

    propertyQueries.create(newProperty);

    // Save amenities
    if (Array.isArray(amenities)) {
      const stmt = db.prepare("INSERT INTO property_amenities (propertyId, amenity) VALUES (?, ?)");
      for (const amenity of amenities) {
        stmt.run(newProperty.id, amenity);
      }
    }

    // Save images
    if (Array.isArray(images)) {
      const stmt = db.prepare("INSERT INTO property_images (propertyId, imageUrl) VALUES (?, ?)");
      for (const imageUrl of images) {
        stmt.run(newProperty.id, imageUrl);
      }
    }

    const fullProperty = hydrateProperty(newProperty as any);
    return res.status(201).json({ property: fullProperty });
  } catch (error) {
    console.error("Add property error:", error);
    return res.status(500).json({ error: "Failed to add property" });
  }
});

// All admin routes below require authentication
router.use(authenticateToken);

// ---------------------------------------------------------------------------
// GET /api/admin/users – list all users (admin only)
// ---------------------------------------------------------------------------

router.get("/users", requireRole("admin"), (_req: Request, res: Response) => {
  try {
    const users = userQueries.getAll() as UserRecord[];
    const sanitized = users.map(sanitizeUser);
    return res.status(200).json({ users: sanitized });
  } catch (error) {
    console.error("Admin get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:id – toggle user status (admin only)
// ---------------------------------------------------------------------------

router.patch("/users/:id", requireRole("admin"), (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    if (status !== "active" && status !== "suspended") {
      return res.status(400).json({ error: "Invalid status. Must be 'active' or 'suspended'." });
    }

    const user = userQueries.findById(id) as UserRecord | undefined;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    userQueries.update(id, { status });

    const updated = userQueries.findById(id) as UserRecord | undefined;
    return res.status(200).json({ user: sanitizeUser(updated!) });
  } catch (error) {
    console.error("Admin update user error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/users/:id – delete a user (admin only)
// ---------------------------------------------------------------------------

router.delete("/users/:id", requireRole("admin"), (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user!.userId === id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = userQueries.findById(id) as UserRecord | undefined;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    userQueries.delete(id);
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/properties – list all properties (admin only)
// ---------------------------------------------------------------------------

router.get("/properties", requireRole("admin"), (_req: Request, res: Response) => {
  try {
    const properties = propertyQueries.getAll() as PropertyRecord[];
    const normalized = properties.map(hydrateProperty);
    return res.status(200).json({ properties: normalized });
  } catch (error) {
    console.error("Admin get properties error:", error);
    return res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/properties/:id – update property status/verified (admin only)
// ---------------------------------------------------------------------------

router.patch("/properties/:id", requireRole("admin"), (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { status, verified, featured, availability } = req.body as {
      status?: string;
      verified?: boolean;
      featured?: boolean;
      availability?: string;
    };

    const property = propertyQueries.findById(id) as PropertyRecord | undefined;
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const updates: Record<string, any> = {};
    if (status !== undefined) {
      updates.status = status;
    }
    if (verified !== undefined) {
      updates.verified = verified ? 1 : 0;
    }
    if (featured !== undefined) {
      updates.featured = featured ? 1 : 0;
    }
    if (availability !== undefined) {
      const validAvailability = ["Available", "Rented", "Coming Soon"];
      if (!validAvailability.includes(availability)) {
        return res.status(400).json({ error: "Invalid availability value" });
      }
      updates.availability = availability;
      // When marking as Rented/booked, automatically remove from featured
      if (availability === "Rented") {
        updates.featured = 0;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    propertyQueries.update(id, updates);

    const updated = propertyQueries.findById(id) as PropertyRecord | undefined;
    return res.status(200).json({ property: hydrateProperty(updated!) });
  } catch (error) {
    console.error("Admin update property error:", error);
    return res.status(500).json({ error: "Failed to update property" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/properties/:id – delete a property (admin only)
// ---------------------------------------------------------------------------

router.delete("/properties/:id", requireRole("admin"), (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const property = propertyQueries.findById(id) as PropertyRecord | undefined;
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Clean up related records
    db.prepare("DELETE FROM property_amenities WHERE propertyId = ?").run(id);
    db.prepare("DELETE FROM property_images WHERE propertyId = ?").run(id);
    db.prepare("DELETE FROM favorites WHERE propertyId = ?").run(id);
    db.prepare("DELETE FROM inquiries WHERE propertyId = ?").run(id);

    propertyQueries.delete(id);
    return res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    console.error("Admin delete property error:", error);
    return res.status(500).json({ error: "Failed to delete property" });
  }
});

// ===========================================================================
// LANDLORD-SPECIFIC ROUTES
// These routes allow landlords to manage their own properties
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /api/admin/properties/landlord – get all properties for the logged-in landlord
// ---------------------------------------------------------------------------

router.get("/properties/landlord", (req: Request, res: Response) => {
  try {
    const landlordId = req.user!.userId;
    const properties = propertyQueries.getByLandlord(landlordId) as PropertyRecord[];
    const hydrated = properties.map(hydrateProperty);
    return res.status(200).json({ properties: hydrated });
  } catch (error) {
    console.error("Landlord get properties error:", error);
    return res.status(500).json({ error: "Failed to fetch landlord properties" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/properties/landlord/:id – update own property
// (landlord can update status, availability, hide/unhide)
// ---------------------------------------------------------------------------

router.patch("/properties/landlord/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.user!.userId;

    const property = propertyQueries.findById(id) as PropertyRecord | undefined;
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Ensure the landlord owns this property
    if (property.landlordId !== landlordId) {
      return res.status(403).json({ error: "You do not own this property" });
    }

    const {
      status,
      availability,
      title,
      description,
      price,
      deposit,
      bedrooms,
      bathrooms,
      county,
      town,
      estate,
      address,
      type,
      amenities,
      images,
    } = req.body as {
      status?: string;
      availability?: string;
      title?: string;
      description?: string;
      price?: number;
      deposit?: number;
      bedrooms?: number;
      bathrooms?: number;
      county?: string;
      town?: string;
      estate?: string;
      address?: string;
      type?: string;
      amenities?: string[];
      images?: string[];
    };

    const updates: Record<string, any> = {};

    if (status !== undefined) {
      const validStatuses = ["pending", "approved", "rejected", "hidden"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      updates.status = status;
    }

    if (availability !== undefined) {
      const validAvailability = ["Available", "Rented", "Coming Soon"];
      if (!validAvailability.includes(availability)) {
        return res.status(400).json({ error: "Invalid availability value" });
      }
      updates.availability = availability;
    }

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (deposit !== undefined) updates.deposit = Number(deposit);
    if (bedrooms !== undefined) updates.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) updates.bathrooms = Number(bathrooms);
    if (county !== undefined) updates.county = county;
    if (town !== undefined) updates.town = town;
    if (estate !== undefined) updates.estate = estate;
    if (address !== undefined) updates.address = address;
    if (type !== undefined) updates.type = type;

    if (Object.keys(updates).length === 0 && !amenities && !images) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    if (Object.keys(updates).length > 0) {
      propertyQueries.update(id, updates);
    }

    // Update amenities if provided
    if (Array.isArray(amenities)) {
      db.prepare("DELETE FROM property_amenities WHERE propertyId = ?").run(id);
      const stmt = db.prepare("INSERT INTO property_amenities (propertyId, amenity) VALUES (?, ?)");
      for (const amenity of amenities) {
        stmt.run(id, amenity);
      }
    }

    // Update images if provided
    if (Array.isArray(images)) {
      db.prepare("DELETE FROM property_images WHERE propertyId = ?").run(id);
      const stmt = db.prepare("INSERT INTO property_images (propertyId, imageUrl) VALUES (?, ?)");
      for (const imageUrl of images) {
        stmt.run(id, imageUrl);
      }
    }

    const updated = propertyQueries.findById(id) as PropertyRecord | undefined;
    return res.status(200).json({ property: hydrateProperty(updated!) });
  } catch (error) {
    console.error("Landlord update property error:", error);
    return res.status(500).json({ error: "Failed to update property" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/properties/landlord/:id – delete own property
// ---------------------------------------------------------------------------

router.delete("/properties/landlord/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.user!.userId;

    const property = propertyQueries.findById(id) as PropertyRecord | undefined;
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Ensure the landlord owns this property
    if (property.landlordId !== landlordId) {
      return res.status(403).json({ error: "You do not own this property" });
    }

    // Clean up related records
    db.prepare("DELETE FROM property_amenities WHERE propertyId = ?").run(id);
    db.prepare("DELETE FROM property_images WHERE propertyId = ?").run(id);
    db.prepare("DELETE FROM favorites WHERE propertyId = ?").run(id);
    db.prepare("DELETE FROM inquiries WHERE propertyId = ?").run(id);

    propertyQueries.delete(id);
    return res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    console.error("Landlord delete property error:", error);
    return res.status(500).json({ error: "Failed to delete property" });
  }
});

export default router;
