import { otpStorage } from '../storage/otp.storage';
import { OTPRecord } from '../types/otp.types';
import { OTP_EXPIRY_MINUTES } from '../config/constants';
import { sendOTP as sendOTPEmail } from './email.service';
import { checkLimit } from './rate-limit.service';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(
  email: string,
  purpose: 'register' | 'forgot-password' | 'update-email' | 'update-phone'
): Promise<{ otp: string; expiresIn: number }> {
  // Check rate limit
  checkLimit(email);

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

  // Store OTP
  const record: OTPRecord = {
    email,
    otp,
    purpose,
    expiresAt,
    verified: false,
  };
  otpStorage.set(email, record);

  // Send OTP via email (console logging in dev)
  await sendOTPEmail(email, otp, purpose);

  return {
    otp,
    expiresIn: OTP_EXPIRY_MINUTES * 60,
  };
}

export function verifyOTP(email: string, otp: string): boolean {
  const record = otpStorage.get(email);

  if (!record) {
    throw new Error('No OTP found. Please request a new OTP.');
  }

  if (new Date() > record.expiresAt) {
    otpStorage.delete(email);
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (record.otp !== otp) {
    throw new Error('Invalid OTP. Please try again.');
  }

  // Mark as verified
  record.verified = true;
  otpStorage.set(email, record);

  return true;
}

export function isOTPVerified(email: string, purpose: 'register' | 'forgot-password' | 'update-email' | 'update-phone'): boolean {
  const record = otpStorage.get(email);
  return !!record && record.verified && record.purpose === purpose;
}

export function clearOTP(email: string): void {
  otpStorage.delete(email);
}
