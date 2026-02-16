import { User } from '../types/user.types';

class UserStorage {
  private users: User[] = [];
  private nextId: number = 1;

  create(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      ...userData,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  findById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  updatePassword(email: string, newPassword: string): boolean {
    const user = this.findByEmail(email);
    if (user) {
      user.password = newPassword;
      return true;
    }
    return false;
  }

  count(): number {
    return this.users.length;
  }

  clear(): void {
    this.users = [];
    this.nextId = 1;
  }
}

export const userStorage = new UserStorage();
