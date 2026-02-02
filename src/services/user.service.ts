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
export function updateProfile(id: number, data: { fullName?: string; avatar?: string }): UserResponse {
  const user = userStorage.updateProfile(id, data);
  if (!user) {
    throw new Error('User not found.');
  }
  return sanitizeUser(user);
}

export async function changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
  const user = userStorage.findById(id);
  if (!user) {
    throw new Error('User not found.');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Mật khẩu cũ không chính xác.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  userStorage.updatePassword(user.email, hashedPassword);
}

export function updateEmail(id: number, newEmail: string): UserResponse {
  // Check if OTP verified for update-email
  if (!isOTPVerified(newEmail, 'update-email')) {
    throw new Error('Email chưa được xác thực. Vui lòng kiểm tra mã OTP.');
  }

  const user = userStorage.updateProfile(id, { email: newEmail });
  if (!user) {
    throw new Error('User not found.');
  }

  clearOTP(newEmail);
  return sanitizeUser(user);
}

export function updatePhone(id: number, newPhone: string): UserResponse {
  // Check if OTP verified for update-phone
  // Note: Phone OTP verification uses the phone number as key in otpStorage
  if (!isOTPVerified(newPhone, 'update-phone')) {
    throw new Error('Số điện thoại chưa được xác thực. Vui lòng kiểm tra mã OTP.');
  }

  const user = userStorage.updateProfile(id, { phone: newPhone });
  if (!user) {
    throw new Error('User not found.');
  }

  clearOTP(newPhone);
  return sanitizeUser(user);
}
