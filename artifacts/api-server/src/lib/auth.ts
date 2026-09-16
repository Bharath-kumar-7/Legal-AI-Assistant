import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";

export type UserRole = "admin" | "client" | "lawyer";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

// ── Mock users for offline / no-DB mode ──────────────────────────────────────
const MOCK_USERS: User[] = [
  { id: 1,   fullName: "Nyaya Administrator", email: "admin@nyaya.in",  passwordHash: "mock", role: "admin",  createdAt: new Date() },
  { id: 101, fullName: "Rahul Sharma",        email: "client@nyaya.in", passwordHash: "mock", role: "client", createdAt: new Date() },
  { id: 201, fullName: "Adv. Rohan Iyer",     email: "lawyer@nyaya.in", passwordHash: "mock", role: "lawyer", createdAt: new Date() },
];

function secret(): string {
  // Use env var if set, otherwise fall back to a dev-only default
  return process.env.SESSION_SECRET ?? "nyaya-dev-secret-key-change-in-production";
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored === "mock") return true; // offline mode accepts any password
  const [, salt, expected] = stored.split("$");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function publicUser(user: User) {
  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role as UserRole };
}

export type PublicUser = ReturnType<typeof publicUser>;

export function signToken(user: User): string {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    sub: String(user.id),
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }));
  const signature = base64Url(createHmac("sha256", secret()).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { id: number; email: string; role: UserRole } | null {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(`${header}.${payload}`).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string; email?: string; role?: UserRole; exp?: number;
    };
    if (!parsed.sub || !parsed.email || !parsed.role || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (!["admin", "client", "lawyer"].includes(parsed.role)) return null;
    return { id: Number(parsed.sub), email: parsed.email, role: parsed.role };
  } catch {
    return null;
  }
}

export async function ensureAdminAccount(): Promise<void> {
  if (!db) return; // offline mode — skip
  const existingAdmin = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "admin")).limit(1);
  if (existingAdmin.length) return;
  const email = process.env.NYAYA_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.NYAYA_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("NYAYA_ADMIN_EMAIL and NYAYA_ADMIN_PASSWORD must be configured");
  if (password.length < 8) throw new Error("NYAYA_ADMIN_PASSWORD must be at least 8 characters");
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length) throw new Error("NYAYA_ADMIN_EMAIL is already registered with a non-admin role");
  await db.insert(usersTable).values({
    fullName: "Nyaya Administrator",
    email,
    passwordHash: hashPassword(password),
    role: "admin",
  });
}

export async function authenticate(
  email: string,
  password: string,
  role: UserRole,
): Promise<{ token: string; user: PublicUser } | null> {
  // Offline / no-DB mode — accept any credentials and return a mock user
  if (!db) {
    const mock = MOCK_USERS.find(u => u.role === role);
    if (!mock) return null;
    const fakeUser = { ...mock, email: email.trim().toLowerCase() };
    return { token: signToken(fakeUser), user: publicUser(fakeUser) };
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.email, email.trim().toLowerCase()), eq(usersTable.role, role)))
    .limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { token: signToken(user), user: publicUser(user) };
}

export async function getUserById(id: number): Promise<PublicUser | null> {
  if (!db) {
    const mock = MOCK_USERS.find(u => u.id === id);
    return mock ? publicUser(mock) : null;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  return user ? publicUser(user) : null;
}

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  role: Exclude<UserRole, "admin">,
): Promise<{ token: string; user: PublicUser }> {
  if (!db) {
    // Offline mode — create an in-memory mock user
    const newUser: User = {
      id: Date.now(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: "mock",
      role,
      createdAt: new Date(),
    };
    MOCK_USERS.push(newUser);
    return { token: signToken(newUser), user: publicUser(newUser) };
  }
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  if (existing.length) throw new Error("An account with this email already exists");
  const [user] = await db
    .insert(usersTable)
    .values({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role,
    })
    .returning();
  return { token: signToken(user), user: publicUser(user) };
}

export function authHeaderToken(header?: string): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}