import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { userQueries } from "./db.js";
import { generateId } from "../client/src/lib/store.js";
import { signToken, authenticateToken } from "./jwt.js";
import type { UserRole } from "../client/src/lib/types.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Bcrypt configuration
// ---------------------------------------------------------------------------

const SALT_ROUNDS = 12; // cost factor – adjust upward as hardware improves

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

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

// ---------------------------------------------------------------------------
// Helper – strip password before sending user data to the client
// ---------------------------------------------------------------------------

function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

router.post("/register", async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // --- Input validation ---
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const validRoles: UserRole[] = ["admin", "landlord", "client"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // --- Duplicate check ---
    const existingUser = userQueries.findByEmail(email.toLowerCase().trim()) as
      | UserRecord
      | undefined;
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // --- Hash password with bcrypt ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Persist user ---
    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    userQueries.create(newUser);

    // --- Issue JWT ---
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return res.status(201).json({
      token,
      user: sanitizeUser(newUser as UserRecord),
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

router.post("/login", async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // --- Input validation ---
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // --- Lookup user ---
    const user = userQueries.findByEmail(email.toLowerCase().trim()) as
      | UserRecord
      | undefined;

    // Use a constant-time comparison path even when user is not found to
    // prevent timing-based user enumeration attacks.
    if (!user) {
      // Perform a dummy hash comparison so response time is consistent
      await bcrypt.compare(password, "$2b$12$dummyhashfortimingnormalization");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // --- Verify password ---
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // --- Account status check ---
    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account has been suspended" });
    }

    // --- Issue JWT ---
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/me  – verify token and return current user (protected)
// ---------------------------------------------------------------------------

router.get("/me", authenticateToken, (req: Request, res: Response) => {
  try {
    const user = userQueries.findById(req.user!.userId) as UserRecord | undefined;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account has been suspended" });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ error: "Failed to get user" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/user/:id  – get user by ID (protected)
// ---------------------------------------------------------------------------

router.get("/user/:id", authenticateToken, (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // Only allow users to fetch their own record, or admins to fetch any
    if (req.user!.userId !== id && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = userQueries.findById(id) as UserRecord | undefined;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
