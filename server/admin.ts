import express, { Request, Response } from "express";
import { userQueries, propertyQueries, db } from "./db.js";
import { requireRole, authenticateToken } from "./jwt.js";

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// ---------------------------------------------------------------------------
// Types
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
  views: number;
  inquiries: number;
  whatsappClicks: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helper – strip password from user records
// ---------------------------------------------------------------------------

function sanitizeUser(user: UserRecord) {
  const { password, ...rest } = user;
  return rest;
}

function normalizeProperty(p: PropertyRecord) {
  return {
    ...p,
    verified: Boolean(p.verified),
  };
}

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
    const normalized = properties.map(normalizeProperty);
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
    const { status, verified } = req.body as { status?: string; verified?: boolean };

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

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    propertyQueries.update(id, updates);

    const updated = propertyQueries.findById(id) as PropertyRecord | undefined;
    return res.status(200).json({ property: normalizeProperty(updated!) });
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

export default router;
