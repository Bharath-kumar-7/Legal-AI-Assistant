import type { NextFunction, Request, Response } from "express";
import { authHeaderToken, verifyToken } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      auth?: { id: number; email: string; role: "admin" | "client" | "lawyer" };
    }
  }
}

// Mock tokens used by the frontend when running without a real DB (dev fallback)
const MOCK_TOKENS: Record<string, { id: number; email: string; role: "admin" | "client" | "lawyer" }> = {
  "mock-admin-session":  { id: 1,   email: "admin@nyaya.in",  role: "admin"  },
  "mock-client-session": { id: 101, email: "client@nyaya.in", role: "client" },
  "mock-lawyer-session": { id: 201, email: "lawyer@nyaya.in", role: "lawyer" },
};

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = authHeaderToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Accept mock dev tokens when not in production
  if (process.env.NODE_ENV !== "production" && MOCK_TOKENS[token]) {
    req.auth = MOCK_TOKENS[token];
    next();
    return;
  }

  const auth = verifyToken(token);
  if (!auth) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.auth = auth;
  next();
}