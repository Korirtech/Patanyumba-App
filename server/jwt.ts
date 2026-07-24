import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// ---------------------------------------------------------------------------
// JWT configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET || "patanyumba_dev_secret_change_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error(
    "FATAL: JWT_SECRET environment variable is not set. " +
      "Set a strong random secret before deploying to production."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Token payload shape
// ---------------------------------------------------------------------------

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request to carry the decoded token
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ---------------------------------------------------------------------------
// Sign a new access token
// ---------------------------------------------------------------------------

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

// ---------------------------------------------------------------------------
// Verify a token and return its payload (throws on failure)
// ---------------------------------------------------------------------------

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ---------------------------------------------------------------------------
// Express middleware – require a valid Bearer token
// ---------------------------------------------------------------------------

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired – please log in again" });
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  }
}

// ---------------------------------------------------------------------------
// Express middleware – require a valid token AND a specific role
// ---------------------------------------------------------------------------

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    authenticateToken(req, res, () => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }
      next();
    });
  };
}
