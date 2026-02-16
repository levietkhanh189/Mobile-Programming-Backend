import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userStorage } from '../storage/user.storage';
import { User, UserResponse, RegisterRequest, LoginRequest } from '../types/user.types';
import { JWTPayload, AuthResponse } from '../types/auth.types';
import { JWT_SECRET, JWT_EXPIRY } from '../config/constants';
import { isOTPVerified, clearOTP } from './otp.service';

export async function registerUser(
  data: RegisterRequest,
  requireOTP: boolean = false
): Promise<AuthResponse> {
  const { email, password, fullName, phone = '' } = data;

  // Check if OTP is required and verified
  if (requireOTP && !isOTPVerified(email, 'register')) {
    throw new Error('Email not verified. Please verify your OTP first.');
  }

  // Check if user already exists
  const existingUser = userStorage.findByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists.');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = userStorage.create({
    email,
    password: hashedPassword,
    fullName,
    phone,
  });

  // Clear OTP if it was used
  if (requireOTP) {
    clearOTP(email);
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email);

  return {
    success: true,
    message: 'Registration successful!',
    user: sanitizeUser(user),
    token,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const { email, password } = data;

  // Find user
  const user = userStorage.findByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password.');
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email);

  return {
    success: true,
    message: 'Login successful!',
    user: sanitizeUser(user),
    token,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

export function generateToken(userId: number, email: string): string {
  const payload: JWTPayload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token.');
  }
}

export function sanitizeUser(user: User): UserResponse {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
