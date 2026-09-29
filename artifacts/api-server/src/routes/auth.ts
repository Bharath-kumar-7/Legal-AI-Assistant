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

  const result = await authenticate(parsed.data.email, parsed.data.password, parsed.data.role);
  if (!result) {
    if (parsed.data.role === 'admin') {
      res.status(401).json({ error: 'Wrong credentials' });
      return;
    }
    res.status(404).json({ error: 'No account found with these details. Please create an account first.' });
    return;
  }

  // Single Admin account logs in directly
  if (result.user.role === 'admin') {
    res.json(LoginResponse.parse(result));
    return;
  }

  // Always generate and send OTP for client/lawyer verification
  const code = await createAndSendOtp(result.user.id, result.user.email, 'login');
  res.json({
    otpSent: true,
    email: result.user.email,
    devOtp: (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) ? code : undefined,
  });
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
  if (!userId) {
    res.status(500).json({ error: 'Server error' });
    return;
  }

  const user = await getUserById(userId);
  if (!user) {
    res.status(401).json({ error: 'Account not found' });
    return;
  }

  // Generate token
  const fullUser = db
    ? (await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1))[0]
    : { id: user.id, fullName: user.fullName, email: user.email, role: user.role, passwordHash: 'mock', createdAt: new Date() };

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

    // If a lawyer, create a lawyer profile
    if (parsed.data.role === 'lawyer') {
      const lawyerId = `LAW-${String(100101 + Math.floor(Date.now() % 10000)).padStart(6, '0')}`;
      if (db) {
        try {
          const { lawyerProfilesTable } = await import('@workspace/db');
          await db.insert(lawyerProfilesTable).values({
            userId: result.user.id,
            lawyerId,
            barCouncilNumber: 'PENDING',
            barCouncilState: 'State Bar Council',
            yearsOfExperience: 1,
            practiceAreas: JSON.stringify(['General Practice']),
            courtLocations: JSON.stringify(['District Court']),
            languages: JSON.stringify(['English', 'Hindi']),
            bio: 'Newly registered advocate awaiting verification.',
            verificationStatus: 'PENDING',
            accountStatus: 'PENDING_VERIFICATION',
            location: 'India',
          });
        } catch (e) {
          console.warn('[signup] Failed to create lawyer profile row in DB:', e);
        }
      } else {
        const { memoryStore } = await import('../lib/memoryStore');
        memoryStore.addLawyerProfile({
          id: Date.now(),
          userId: result.user.id,
          lawyerId,
          fullName: result.user.fullName,
          email: result.user.email,
          phone: '+91 98000 00000',
          location: 'India',
          barCouncilNumber: 'PENDING',
          barCouncilState: 'State Bar Council',
          yearsOfExperience: 1,
          practiceAreas: ['General Practice'],
          courtLocations: ['District Court'],
          languages: ['English', 'Hindi'],
          bio: 'Newly registered advocate awaiting verification.',
          fee: 1500,
          rating: 5.0,
          reviews: 0,
          verificationStatus: 'PENDING',
          accountStatus: 'PENDING_VERIFICATION',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Always send OTP for account verification
    const code = await createAndSendOtp(result.user.id, result.user.email, 'signup');
    res.status(201).json({
      otpSent: true,
      email: result.user.email,
      devOtp: (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) ? code : undefined,
    });
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