import { Request, Response } from 'express';
import prisma from '../config/database';

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const search = (req.query['search'] as string) || '';
    const where: {
      OR?: Array<{
        fullName?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          points: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    throw err;
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        points: true,
        createdAt: true,
        orders: {
          select: { id: true, totalAmount: true, status: true, createdAt: true },
        },
      },
    });
    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy user' });
      return;
    }
    res.json({ user });
  } catch (err) {
    throw err;
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const { role } = req.body as { role?: string };
    if (!role || !['CUSTOMER', 'MANAGER', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Role không hợp lệ' });
      return;
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role: role as 'CUSTOMER' | 'MANAGER' | 'ADMIN' },
      select: { id: true, email: true, role: true },
    });
    res.json({ user });
  } catch (err) {
    throw err;
  }
};
