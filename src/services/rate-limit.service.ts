import { rateLimitStorage } from '../storage/rate-limit.storage';
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MINUTES } from '../config/constants';

export function checkLimit(email: string): void {
  const now = new Date();
  const record = rateLimitStorage.get(email);

  if (record) {
    if (now < record.resetTime) {
      if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        const remainingMinutes = Math.ceil(
          (record.resetTime.getTime() - now.getTime()) / 60000
        );
        throw new Error(
          `Too many OTP requests. Please try again after ${remainingMinutes} minute(s).`
        );
      }
      record.count++;
      rateLimitStorage.set(email, record);
    } else {
      // Reset window expired, start new window
      rateLimitStorage.set(email, {
        count: 1,
        resetTime: new Date(now.getTime() + RATE_LIMIT_WINDOW_MINUTES * 60000),
      });
    }
  } else {
    // First request for this email
    rateLimitStorage.set(email, {
      count: 1,
      resetTime: new Date(now.getTime() + RATE_LIMIT_WINDOW_MINUTES * 60000),
    });
  }
}
