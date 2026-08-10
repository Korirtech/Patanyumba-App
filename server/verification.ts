/**
 * Email Verification Module
 *
 * Implements a 6-digit OTP-based email verification flow.
 * Codes are stored in-memory with a 15-minute TTL.
 *
 * Codes are sent through the configured email service. When SMTP is not
 * configured in development, the code is returned to the caller so local
 * testing remains possible; production registration treats delivery failure as
 * an error.
 */

import { randomInt } from "node:crypto";
import express, { Request, Response } from "express";
import { userQueries } from "./db.js";
import { signToken } from "./jwt.js";
import { sendVerificationEmail, sendWelcomeEmail } from "./email.js";

// ---------------------------------------------------------------------------
// In-memory code store (shared via globalThis so auth.ts and this module
// always reference the same map, regardless of module caching)
// ---------------------------------------------------------------------------

interface PendingCode {
  code: string;
  expiresAt: number; // Unix ms
  attempts: number;
}

function getCodeStore(): Map<string, PendingCode> {
  const g = globalThis as any;
  if (!g.__pendingVerificationCodes) {
    g.__pendingVerificationCodes = new Map<string, PendingCode>();
  }
  return g.__pendingVerificationCodes as Map<string, PendingCode>;
}

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  // Cryptographically random 6-digit code
  return String(randomInt(100_000, 999_999));
}

function storeCode(email: string): string {
  const code = generateCode();
  getCodeStore().set(email, {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });
  return code;
}

function verifyCode(email: string, inputCode: string): "ok" | "expired" | "invalid" | "too_many" {
  const store = getCodeStore();
  const entry = store.get(email);
  if (!entry) return "expired";
  if (Date.now() > entry.expiresAt) {
    store.delete(email);
    return "expired";
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(email);
    return "too_many";
  }
  if (entry.code !== inputCode.trim()) {
    entry.attempts += 1;
    return "invalid";
  }
  store.delete(email);
  return "ok";
}

// ---------------------------------------------------------------------------
// Code generation and email delivery
// ---------------------------------------------------------------------------

export interface VerificationDeliveryResult {
  code: string;
  sent: boolean;
  error?: string;
}

/**
 * Generate, store, and deliver one verification code. Keeping this operation
 * here ensures registration and resend always use the same in-memory store.
 */
export async function createAndSendVerificationCode(
  email: string
): Promise<VerificationDeliveryResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const code = storeCode(normalizedEmail);
  const result = await sendVerificationEmail(normalizedEmail, code);

  if (!result.success) {
    console.warn(`Failed to send verification email to ${normalizedEmail}: ${result.error}`);
    // Development fallback only; production callers must treat this as failure.
    console.log(`[DEV] Verification code for ${normalizedEmail}: ${code}`);
  }

  return {
    code,
    sent: result.success,
    ...(result.error ? { error: result.error } : {}),
  };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/auth/send-verification
// Body: { email }
// Generates a new code and (simulates) sending it.
// Returns the code in the response for demo/dev purposes.
// ---------------------------------------------------------------------------

router.post("/send-verification", async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = (await userQueries.findByEmail(normalizedEmail)) as
      | { id: string; emailVerified: number; status: string }
      | undefined;

    if (!user) {
      return res.status(404).json({ error: "No account found with that email" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const delivery = await createAndSendVerificationCode(normalizedEmail);

    if (!delivery.sent && process.env.NODE_ENV === "production") {
      return res.status(503).json({
        error: "The verification email could not be sent. Please try again later.",
      });
    }

    const response: { message: string; devCode?: string } = {
      message: "Verification code sent",
    };

    if (!delivery.sent && process.env.NODE_ENV !== "production") {
      response.devCode = delivery.code;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Send verification error:", error);
    return res.status(500).json({ error: "Failed to send verification code" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/verify-email
// Body: { email, code }
// Verifies the code and marks the user as verified, then issues a full JWT.
// ---------------------------------------------------------------------------

router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const result = verifyCode(normalizedEmail, code);

    if (result === "expired") {
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }
    if (result === "too_many") {
      return res.status(429).json({ error: "Too many failed attempts. Please request a new code." });
    }
    if (result === "invalid") {
      return res.status(400).json({ error: "Invalid verification code. Please try again." });
    }

    // Mark user as verified in the database
    await userQueries.update(normalizedEmail, { emailVerified: 1 }, "email");

    // Fetch the updated user and issue a full JWT
    const user = (await userQueries.findByEmail(normalizedEmail)) as
      | {
          id: string;
          name: string;
          email: string;
          phone: string;
          role: string;
          status: string;
          createdAt: string;
        }
      | undefined;

    if (!user) {
      return res.status(500).json({ error: "User not found after verification" });
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
