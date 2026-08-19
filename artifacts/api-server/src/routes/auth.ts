import { Router, type IRouter } from "express";
import { LoginBody, SignupBody, LoginResponse, GetMeResponse } from "@workspace/api-zod";
import { authenticate, registerUser, verifyToken, authHeaderToken, getUserById } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = await authenticate(parsed.data.email, parsed.data.password, parsed.data.role);
  if (!result) {
    res.status(401).json({ error: "Email, password, or role is incorrect" });
    return;
  }
  res.json(LoginResponse.parse(result));
});

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const result = await registerUser(parsed.data.fullName, parsed.data.email, parsed.data.password, parsed.data.role);
    res.status(201).json(LoginResponse.parse(result));
  } catch (error) {
    res.status(409).json({ error: error instanceof Error ? error.message : "Unable to create account" });
  }
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const token = authHeaderToken(req.headers.authorization);
  const auth = token ? verifyToken(token) : null;
  if (!auth) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const user = await getUserById(auth.id);
  if (!user) {
    res.status(401).json({ error: "Account no longer exists" });
    return;
  }
  res.json(GetMeResponse.parse(user));
});

export default router;