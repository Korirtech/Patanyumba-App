import express, { Request, Response } from "express";
import { userQueries } from "./db.js";
import { generateId } from "../client/src/lib/store.js";
import type { UserRole } from "../client/src/lib/types.js";

const router = express.Router();

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

/**
 * POST /api/auth/register
 * Register a new user with persistent storage
 */
router.post("/register", (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const existingUser = userQueries.findByEmail(email) as UserRecord | undefined;
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Create new user
    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(), // TODO: Hash password in production
      role,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    userQueries.create(newUser);

    // Return user data (without password)
    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post("/login", (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = userQueries.findByEmail(email) as UserRecord | undefined;
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password (TODO: Use bcrypt in production)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check account status
    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account has been suspended" });
    }

    // Return user data (without password)
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

/**
 * GET /api/auth/user/:id
 * Get user by ID
 */
router.get("/user/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const user = userQueries.findById(id) as UserRecord | undefined;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
