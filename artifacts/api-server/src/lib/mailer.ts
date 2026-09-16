import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, ''),
  },
});

export async function sendOtpEmail(to: string, otp: string, purpose: 'login' | 'signup' | 'reset'): Promise<void> {
  const subjects: Record<string, string> = {
    login: 'Nyaya — Your Sign-In OTP',
    signup: 'Nyaya — Verify Your Account',
    reset: 'Nyaya — Password Reset OTP',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Inter', Arial, sans-serif; background: #f8f9fc; margin: 0; padding: 20px;">
      <div style="max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; border: 1px solid #e8eaf0; overflow: hidden;">
        <div style="background: #1a2744; padding: 28px 32px;">
          <h1 style="color: #fff; font-size: 22px; margin: 0; letter-spacing: -0.5px;">⚖️ nyaya</h1>
          <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 6px 0 0;">Legal support, with clarity.</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="font-size: 18px; color: #1a1d27; margin: 0 0 8px;">${purpose === 'signup' ? 'Verify your account' : purpose === 'login' ? 'Sign in to Nyaya' : 'Reset your password'}</h2>
          <p style="color: #5a6175; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
            ${purpose === 'signup'
              ? 'Enter the code below to verify your email and activate your Nyaya account.'
              : purpose === 'login'
              ? 'Enter the code below to complete your sign-in.'
              : 'Enter the code below to reset your password.'}
          </p>
          <div style="background: #eef1f8; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #8890a4; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; margin: 0 0 8px; text-transform: uppercase;">Your verification code</p>
            <p style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #1a2744; margin: 0; font-family: monospace;">${otp}</p>
            <p style="color: #8890a4; font-size: 12px; margin: 12px 0 0;">This code expires in <strong>10 minutes</strong></p>
          </div>
          <p style="color: #8890a4; font-size: 12px; line-height: 1.6; margin: 0;">
            If you didn't request this code, you can safely ignore this email. Your account remains secure.
          </p>
        </div>
        <div style="background: #f8f9fc; border-top: 1px solid #e8eaf0; padding: 16px 32px;">
          <p style="color: #8890a4; font-size: 11px; margin: 0;">Nyaya Legal Platform · Built for the Indian legal journey</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Nyaya Legal" <${process.env.GMAIL_USER}>`,
    to,
    subject: subjects[purpose],
    html,
  });
}

export async function verifyMailer(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
