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

  updateProfile(id: number, data: { fullName?: string; avatar?: string; phone?: string; email?: string }): User | undefined {
    const user = this.findById(id);
    if (user) {
      if (data.fullName) user.fullName = data.fullName;
      if (data.avatar) user.avatar = data.avatar;
      if (data.phone) user.phone = data.phone;
      if (data.email) user.email = data.email;
      return user;
    }
    return undefined;
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
