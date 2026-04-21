import prisma from '../config/database';
import { User } from '../types/user.types';

class UserStorage {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'role' | 'points'>): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone || '',
        avatar: userData.avatar,
      },
    });
    return this.toUser(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? this.toUser(user) : undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.toUser(user) : undefined;
  }

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { password: newPassword },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateProfile(
    id: number,
    data: { fullName?: string; avatar?: string; phone?: string; email?: string },
  ): Promise<User | undefined> {
    try {
      const updateData: Record<string, string> = {};
      if (data.fullName) updateData.fullName = data.fullName;
      if (data.avatar) updateData.avatar = data.avatar;
      if (data.phone) updateData.phone = data.phone;
      if (data.email) updateData.email = data.email;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      return this.toUser(user);
    } catch {
      return undefined;
    }
  }

  async addPoints(userId: number, amount: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    });
  }

  // Convert Prisma model to app User type
  private toUser(row: {
    id: number;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    avatar: string | null;
    role: string;
    points: number;
    createdAt: Date;
  }): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      fullName: row.fullName,
      phone: row.phone,
      avatar: row.avatar ?? undefined,
      role: row.role as User['role'],
      points: row.points,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

export const userStorage = new UserStorage();
