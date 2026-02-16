import './environment';

export const PORT = parseInt(process.env.PORT || '3000', 10);
export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
export const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3', 10);
export const RATE_LIMIT_WINDOW_MINUTES = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
