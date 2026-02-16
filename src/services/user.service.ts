import bcrypt from 'bcryptjs';
import { userStorage } from '../storage/user.storage';
import { UserResponse } from '../types/user.types';
import { sanitizeUser } from './auth.service';
import { isOTPVerified, clearOTP } from './otp.service';

export function getUserById(id: number): UserResponse {
  const user = userStorage.findById(id);
  if (!user) {
    throw new Error('User not found.');
  }
  return sanitizeUser(user);
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  // Check if OTP is verified for forgot-password
  if (!isOTPVerified(email, 'forgot-password')) {
    throw new Error('Email not verified. Please verify your OTP first.');
  }

  // Check if user exists
  const user = userStorage.findByEmail(email);
  if (!user) {
    throw new Error('User not found.');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  userStorage.updatePassword(email, hashedPassword);

  // Clear OTP
  clearOTP(email);
}
