import { NODE_ENV } from '../config/constants';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const MAIL_FROM = process.env.MAIL_FROM || '';
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Mobile App';

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

  if (!BREVO_API_KEY || !MAIL_FROM) {
    console.log('⚠️  Brevo not configured. Set BREVO_API_KEY and MAIL_FROM in env to send real emails.');
    return;
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: MAIL_FROM, name: MAIL_FROM_NAME },
        to: [{ email }],
        subject: `Mã OTP: ${otp} - Xác thực tài khoản`,
        htmlContent: buildOTPEmailHTML(otp, purpose),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`❌ Brevo API error ${res.status} sending to ${email}: ${body}`);
      return;
    }
    console.log(`✅ OTP email sent to ${email} via Brevo`);
  } catch (err) {
    console.error(`❌ Failed to send OTP email to ${email}:`, err instanceof Error ? err.message : err);
  }
}
