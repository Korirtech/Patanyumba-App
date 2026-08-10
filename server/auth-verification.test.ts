import express from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type TestUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status: string;
  emailVerified: number;
  createdAt: string;
};

const users = new Map<string, TestUser>();

vi.mock("./db.js", () => ({
  userQueries: {
    create: async (user: TestUser) => {
      users.set(user.email, { ...user });
      return [{ id: user.id }];
    },
    findByEmail: async (email: string) => users.get(email),
    findById: async (id: string) => [...users.values()].find((user) => user.id === id),
    getAll: async () => [...users.values()],
    update: async (id: string, data: Record<string, unknown>, by: "id" | "email" = "id") => {
      const user = by === "email" ? users.get(id) : [...users.values()].find((item) => item.id === id);
      if (!user) return [];
      Object.assign(user, data);
      return [user];
    },
    delete: async (id: string) => {
      const user = [...users.values()].find((item) => item.id === id);
      if (!user) return [];
      users.delete(user.email);
      return [user];
    },
  },
  initializeDatabase: async () => {},
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      propertyImages: { findMany: vi.fn() },
      propertyAmenities: { findMany: vi.fn() },
    },
  },
}));

let app: express.Express;
let authRouter: express.Router;

let server: ReturnType<express.Express["listen"]>;
let baseUrl = "";

async function postToApp(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    body: (await response.json()) as Record<string, any>,
  };
}

describe("registration email verification flow", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "verification-test-secret";
    process.env.NODE_ENV = "test";
    const imported = await import("./auth.js");
    authRouter = imported.default;
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not start");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(() => {
    users.clear();
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it("creates an unverified account, exposes a development code, and verifies it", async () => {
    const email = "new-user@example.com";
    const registration = await postToApp("/api/auth/register", {
      name: "New User",
      email,
      phone: "0712345678",
      password: "TestPass123!",
      role: "client",
    });

    expect(registration.status).toBe(201);
    expect(registration.body.requiresVerification).toBe(true);
    expect(registration.body.token).toBeUndefined();
    expect(registration.body.user.emailVerified).toBe(false);
    expect(registration.body.devCode).toMatch(/^\d{6}$/);
    expect(users.get(email)?.emailVerified).toBe(0);

    const resend = await postToApp("/api/auth/send-verification", { email });
    expect(resend.status).toBe(200);
    expect(resend.body.message).toBe("Verification code sent");
    expect(resend.body.devCode).toMatch(/^\d{6}$/);

    const verification = await postToApp("/api/auth/verify-email", {
      email,
      code: resend.body.devCode,
    });

    expect(verification.status).toBe(200);
    expect(verification.body.message).toBe("Email verified successfully");
    expect(verification.body.user.emailVerified).toBe(true);
    expect(verification.body.token).toEqual(expect.any(String));
    expect(users.get(email)?.emailVerified).toBe(1);

    const login = await postToApp("/api/auth/login", {
      email,
      password: "TestPass123!",
    });
    expect(login.status).toBe(200);
    expect(login.body.user.emailVerified).toBe(true);
  });

  it("rejects production registration when SMTP delivery is unavailable and removes the account", async () => {
    process.env.NODE_ENV = "production";
    const email = "smtp-failure@example.com";

    const registration = await postToApp("/api/auth/register", {
      name: "SMTP Failure",
      email,
      phone: "0712345678",
      password: "TestPass123!",
      role: "client",
    });

    expect(registration.status).toBe(503);
    expect(registration.body.error).toContain("verification email could not be sent");
    expect(users.has(email)).toBe(false);
    process.env.NODE_ENV = "test";
  });
});
