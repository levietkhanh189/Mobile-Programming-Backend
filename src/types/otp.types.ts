export interface OTPRecord {
  email: string;
  otp: string;
  purpose: 'register' | 'forgot-password' | 'update-email' | 'update-phone';
  expiresAt: Date;
  verified: boolean;
}

export interface OTPStore {
  [email: string]: OTPRecord;
}

export interface SendOTPRequest {
  email: string;
  purpose: 'register' | 'forgot-password' | 'update-email' | 'update-phone';
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}
