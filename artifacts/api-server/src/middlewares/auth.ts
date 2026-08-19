import type { NextFunction, Request, Response } from "express";
import { authHeaderToken, verifyToken } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      auth?: { id: number; email: string; role: "admin" | "client" | "lawyer" };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = authHeaderToken(req.headers.authorization);
  const auth = token ? verifyToken(token) : null;
  if (!auth) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.auth = auth;
  next();
}