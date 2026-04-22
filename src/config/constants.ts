import './environment';

export const PORT = parseInt(process.env.PORT || '3000', 10);
export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
export const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
export const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3', 10);
export const RATE_LIMIT_WINDOW_MINUTES = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';

// SePay payment gateway (sandbox / production)
export const SEPAY_MERCHANT_ID = process.env.SEPAY_MERCHANT_ID || '';
export const SEPAY_SECRET_KEY = process.env.SEPAY_SECRET_KEY || '';
export const SEPAY_ENV = (process.env.SEPAY_ENV || 'sandbox') as 'sandbox' | 'production';
// Fixed conversion rate USD -> VND for sandbox testing
export const USD_TO_VND_RATE = parseInt(process.env.USD_TO_VND_RATE || '25000', 10);
// Public base URL for webhook + return URLs (Railway prod or ngrok/local)
export const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
