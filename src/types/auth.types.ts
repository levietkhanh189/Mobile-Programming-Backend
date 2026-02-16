import { UserResponse } from './user.types';

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserResponse;
  token?: string;
  expiresIn?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  user?: UserResponse;
  token?: string;
  expiresIn?: number;
  purpose?: string;
  remainingTime?: number;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}
