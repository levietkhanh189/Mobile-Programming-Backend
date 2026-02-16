import { OTPRecord, OTPStore } from '../types/otp.types';

class OTPStorage {
  private store: OTPStore = {};

  set(email: string, record: OTPRecord): void {
    this.store[email.toLowerCase()] = record;
  }

  get(email: string): OTPRecord | undefined {
    return this.store[email.toLowerCase()];
  }

  delete(email: string): void {
    delete this.store[email.toLowerCase()];
  }

  clear(): void {
    this.store = {};
  }
}

export const otpStorage = new OTPStorage();
