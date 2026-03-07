import bcrypt from 'bcryptjs';
import { userStorage } from '../storage/user.storage';
import { UserResponse } from '../types/user.types';
import { sanitizeUser } from './auth.service';
import { isOTPVerified, clearOTP } from './otp.service';

export async function getUserById(id: number): Promise<UserResponse> {
  const user = await userStorage.findById(id);
  if (!user) {
    throw new Error('User not found.');
  }
  return sanitizeUser(user);
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  if (!isOTPVerified(email, 'forgot-password')) {
    throw new Error('Email not verified. Please verify your OTP first.');
  }

  const user = await userStorage.findByEmail(email);
  if (!user) {
    throw new Error('User not found.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userStorage.updatePassword(email, hashedPassword);
  clearOTP(email);
}

export async function updateProfile(id: number, data: { fullName?: string; avatar?: string }): Promise<UserResponse> {
  const user = await userStorage.updateProfile(id, data);
  if (!user) {
    throw new Error('User not found.');
  }
  return sanitizeUser(user);
}

export async function changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
  const user = await userStorage.findById(id);
  if (!user) {
    throw new Error('User not found.');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Mat khau cu khong chinh xac.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userStorage.updatePassword(user.email, hashedPassword);
}

export async function updateEmail(id: number, newEmail: string): Promise<UserResponse> {
  if (!isOTPVerified(newEmail, 'update-email')) {
    throw new Error('Email chua duoc xac thuc. Vui long kiem tra ma OTP.');
  }

  const user = await userStorage.updateProfile(id, { email: newEmail });
  if (!user) {
    throw new Error('User not found.');
  }

  clearOTP(newEmail);
  return sanitizeUser(user);
}

export async function updatePhone(id: number, newPhone: string): Promise<UserResponse> {
  if (!isOTPVerified(newPhone, 'update-phone')) {
    throw new Error('So dien thoai chua duoc xac thuc. Vui long kiem tra ma OTP.');
  }

  const user = await userStorage.updateProfile(id, { phone: newPhone });
  if (!user) {
    throw new Error('User not found.');
  }

  clearOTP(newPhone);
  return sanitizeUser(user);
}
