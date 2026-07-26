import rateLimit from "express-rate-limit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonLimitHandler(
  _req: any,
  res: any,
  _next: any,
  options: { message: string }
) {
  res.status(429).json({ error: options.message });
}

// ---------------------------------------------------------------------------
// Login limiter – 5 attempts per 5 minutes per IP
// Prevents brute-force credential stuffing attacks.
// ---------------------------------------------------------------------------

export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many login attempts. Please try again in 5 minutes.",
  handler: jsonLimitHandler,
  skipSuccessfulRequests: true, // only count failed attempts toward the limit
});

// ---------------------------------------------------------------------------
// Registration limiter – 3 registrations per hour per IP
// Prevents mass account creation / spam.
// ---------------------------------------------------------------------------

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many registration attempts. Please try again in 1 hour.",
  handler: jsonLimitHandler,
});

// ---------------------------------------------------------------------------
// General API limiter – 200 requests per 15 minutes per IP
// Provides a broad safety net for all API endpoints.
// ---------------------------------------------------------------------------

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests. Please slow down and try again shortly.",
  handler: jsonLimitHandler,
});
