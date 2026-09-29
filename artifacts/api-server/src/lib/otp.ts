import { randomInt } from 'node:crypto';
import { db, otpCodesTable, usersTable } from '@workspace/db';
import { eq, and, gt } from 'drizzle-orm';
import { sendOtpEmail } from './mailer';

const OTP_EXPIRY_MINUTES = 10;

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

import { memoryStore } from './memoryStore';

export async function createAndSendOtp(
  userId: number,
  email: string,
  purpose: 'login' | 'signup' | 'reset',
): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Always store in memory store for instant/offline verification
  memoryStore.storeOtp(email, code, purpose, userId);

  if (db) {
    // Invalidate any existing unused OTPs for this user+purpose
    await db
      .update(otpCodesTable)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(otpCodesTable.userId, userId),
          eq(otpCodesTable.purpose, purpose),
        ),
      );

    // Store new OTP in database
    await db.insert(otpCodesTable).values({
      userId,
      email,
      code,
      purpose,
      expiresAt,
    });
  }

  console.log(`\n======================================================`);
  console.log(`🔐 [NYAYA OTP DISPATCH]`);
  console.log(`Recipient : ${email}`);
  console.log(`Purpose   : ${purpose.toUpperCase()}`);
  console.log(`OTP Code  : >>> ${code} <<<`);
  console.log(`Expires in: ${OTP_EXPIRY_MINUTES} minutes`);
  console.log(`======================================================\n`);

  // Attempt real email delivery if credentials are provided
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      await sendOtpEmail(email, code, purpose);
      console.log(`[mailer] Email successfully delivered to ${email}`);
    } catch (err: any) {
      console.warn(`[mailer] SMTP email delivery note: ${err.message}`);
    }
  } else {
    console.log(`[mailer] GMAIL_USER/GMAIL_APP_PASSWORD not set. Using server log OTP for verification.`);
  }

  return code;
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: 'login' | 'signup' | 'reset',
): Promise<{ valid: boolean; userId?: number }> {
  // Check memoryStore first
  const memoryResult = memoryStore.verifyOtp(email, code, purpose);
  if (memoryResult.valid) {
    return memoryResult;
  }

  if (!db) {
    return { valid: false };
  }

  const now = new Date();
  const [otp] = await db
    .select()
    .from(otpCodesTable)
    .where(
      and(
        eq(otpCodesTable.email, email),
        eq(otpCodesTable.code, code),
        eq(otpCodesTable.purpose, purpose),
        gt(otpCodesTable.expiresAt, now),
      ),
    )
    .limit(1);

  if (!otp || otp.usedAt) return { valid: false };

  // Mark as used
  await db
    .update(otpCodesTable)
    .set({ usedAt: now })
    .where(eq(otpCodesTable.id, otp.id));

  return { valid: true, userId: otp.userId };
}
