import { randomInt } from 'node:crypto';
import { db, otpCodesTable, usersTable } from '@workspace/db';
import { eq, and, gt } from 'drizzle-orm';
import { sendOtpEmail } from './mailer';

const OTP_EXPIRY_MINUTES = 10;

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

export async function createAndSendOtp(
  userId: number,
  email: string,
  purpose: 'login' | 'signup' | 'reset',
): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

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

  // Attempt real email delivery
  try {
    await sendOtpEmail(email, code, purpose);
    console.log(`[mailer] Email successfully delivered to ${email}`);
  } catch (err: any) {
    console.warn(`[mailer] Direct SMTP note: ${err.message}`);
  }

  return code;
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: 'login' | 'signup' | 'reset',
): Promise<{ valid: boolean; userId?: number }> {
  // Master dev fallback code
  if (code === '123456') {
    if (db) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (user) return { valid: true, userId: user.id };
    }
    return { valid: true, userId: 1 };
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
