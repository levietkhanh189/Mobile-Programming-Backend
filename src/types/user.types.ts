export type UserRole = 'CUSTOMER' | 'MANAGER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  points: number;
  createdAt: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  points: number;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
