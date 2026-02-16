interface RateLimitRecord {
  count: number;
  resetTime: Date;
}

interface RateLimitStore {
  [email: string]: RateLimitRecord;
}

class RateLimitStorage {
  private store: RateLimitStore = {};

  set(email: string, record: RateLimitRecord): void {
    this.store[email.toLowerCase()] = record;
  }

  get(email: string): RateLimitRecord | undefined {
    return this.store[email.toLowerCase()];
  }

  delete(email: string): void {
    delete this.store[email.toLowerCase()];
  }

  clear(): void {
    this.store = {};
  }
}

export const rateLimitStorage = new RateLimitStorage();
