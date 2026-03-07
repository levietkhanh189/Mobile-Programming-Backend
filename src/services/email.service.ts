import nodemailer from 'nodemailer';
import { NODE_ENV } from '../config/constants';

// Gmail SMTP config from environment variables
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

function buildOTPEmailHTML(otp: string, purpose: string): string {
  const purposeText = purpose === 'register'
    ? 'đăng ký tài khoản'
    : purpose === 'forgot-password'
      ? 'đặt lại mật khẩu'
      : 'xác thực';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #333; text-align: center;">Mã xác thực OTP</h2>
      <p style="color: #555;">Bạn đang yêu cầu ${purposeText}. Mã OTP của bạn là:</p>
      <div style="background: #f4f4f4; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
      </div>
      <p style="color: #888; font-size: 14px;">Mã này có hiệu lực trong 5 phút. Không chia sẻ mã này với bất kỳ ai.</p>
    </div>
  `;
}

export async function sendOTP(
  email: string,
  otp: string,
  purpose: 'register' | 'forgot-password' | 'update-email' | 'update-phone'
): Promise<void> {
  // Always log to console in development
  if (NODE_ENV === 'development') {
    console.log('\n========================================');
    console.log('📧 OTP EMAIL');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for: 5 minutes`);
    console.log('========================================\n');
  }

  // Send real email if SMTP is configured
  if (SMTP_USER && SMTP_PASS) {
    await transporter.sendMail({
      from: `"Mobile App" <${SMTP_USER}>`,
      to: email,
      subject: `Mã OTP: ${otp} - Xác thực tài khoản`,
      html: buildOTPEmailHTML(otp, purpose),
    });
    console.log(`✅ OTP email sent to ${email}`);
  } else {
    console.log('⚠️  SMTP not configured. Set SMTP_USER and SMTP_PASS in .env to send real emails.');
  }
}
