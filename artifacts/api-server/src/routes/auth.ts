import { Router, type IRouter } from 'express';
import { LoginBody, SignupBody, LoginResponse, GetMeResponse } from '@workspace/api-zod';
import {
  authenticate,
  registerUser,
  verifyToken,
  authHeaderToken,
  getUserById,
  signToken,
} from '../lib/auth';
import { requireAuth } from '../middlewares/auth';
import { createAndSendOtp, verifyOtp } from '../lib/otp';
import { db, usersTable } from '@workspace/db';
import { eq, and } from 'drizzle-orm';

const router: IRouter = Router();

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Step 1: validate credentials → send OTP email
router.post('/auth/login', async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  // If DB is offline, fall straight through to the mock token flow
  if (!db) {
    const result = await authenticate(parsed.data.email, parsed.data.password, parsed.data.role);
    if (!result) {
      res.status(401).json({ error: 'Email, password, or role is incorrect' });
      return;
    }
    res.json(LoginResponse.parse(result));
    return;
  }

  const result = await authenticate(parsed.data.email, parsed.data.password, parsed.data.role);
  if (!result) {
    res.status(401).json({ error: 'Email, password, or role is incorrect' });
    return;
  }

  // Always generate and send OTP for verification
  await createAndSendOtp(result.user.id, result.user.email, 'login');
  res.json({ otpSent: true, email: result.user.email });
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
// Step 2: verify OTP → return token + user
router.post('/auth/verify-otp', async (req, res): Promise<void> => {
  const { email, code, purpose } = req.body as {
    email?: string;
    code?: string;
    purpose?: 'login' | 'signup' | 'reset';
  };

  if (!email || !code || code.length !== 6 || !purpose) {
    res.status(400).json({ error: 'Invalid OTP request. Email, 6-digit code, and purpose are required.' });
    return;
  }

  const { valid, userId } = await verifyOtp(email, code, purpose);

  if (!valid) {
    res.status(401).json({ error: 'Invalid or expired OTP. Please try again.' });
    return;
  }

  // Fetch user and return token
  if (!db || !userId) {
    res.status(500).json({ error: 'Server error' });
    return;
  }

  const user = await getUserById(userId);
  if (!user) {
    res.status(401).json({ error: 'Account not found' });
    return;
  }

  // Generate token
  const [fullUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!fullUser) {
    res.status(401).json({ error: 'Account not found' });
    return;
  }

  const token = signToken(fullUser);
  res.json(LoginResponse.parse({ token, user }));
});

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/auth/signup', async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const result = await registerUser(
      parsed.data.fullName,
      parsed.data.email,
      parsed.data.password,
      parsed.data.role,
    );

    if (!db) {
      // Offline mode — no OTP, return token directly
      res.status(201).json(LoginResponse.parse(result));
      return;
    }

    // If a lawyer, create a lawyer_profiles row
    if (parsed.data.role === 'lawyer') {
      try {
        const { lawyerProfilesTable } = await import('@workspace/db');
        const lawyerCount = await db.select().from(lawyerProfilesTable).limit(999);
        const lawyerId = `LAW-${String(100101 + lawyerCount.length).padStart(6, '0')}`;
        await db.insert(lawyerProfilesTable).values({
          userId: result.user.id,
          lawyerId,
          barCouncilNumber: '',
          barCouncilState: '',
          yearsOfExperience: 0,
          practiceAreas: '[]',
          courtLocations: '[]',
          languages: '["English"]',
          bio: '',
          verificationStatus: 'PENDING',
          accountStatus: 'ACTIVE',
          location: '',
        });
      } catch (e) {
        console.warn('[signup] Failed to create lawyer profile row:', e);
      }
    }

    // Always send OTP for account verification
    await createAndSendOtp(result.user.id, result.user.email, 'signup');
    res.status(201).json({ otpSent: true, email: result.user.email });
  } catch (error) {
    res.status(409).json({ error: error instanceof Error ? error.message : 'Unable to create account' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/auth/me', requireAuth, async (req, res): Promise<void> => {
  const token = authHeaderToken(req.headers.authorization);
  const auth = token ? verifyToken(token) : null;
  if (!auth) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const user = await getUserById(auth.id);
  if (!user) {
    res.status(401).json({ error: 'Account no longer exists' });
    return;
  }
  res.json(GetMeResponse.parse(user));
});

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────
router.post('/auth/resend-otp', async (req, res): Promise<void> => {
  const { email, purpose } = req.body as { email?: string; purpose?: string };
  if (!email || !purpose) {
    res.status(400).json({ error: 'email and purpose required' });
    return;
  }
  if (!db) {
    res.json({ otpSent: true });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(404).json({ error: 'No account found with this email' });
    return;
  }
  try {
    await createAndSendOtp(user.id, user.email, purpose as 'login' | 'signup' | 'reset');
    res.json({ otpSent: true });
  } catch {
    res.status(500).json({ error: 'Failed to send OTP. Please check mailer configuration.' });
  }
});

export default router;