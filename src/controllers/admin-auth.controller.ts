import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRY } from '../config/constants';

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email và password bắt buộc' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      res.status(403).json({ error: 'Tài khoản không có quyền admin' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Sai mật khẩu' });
      return;
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY } as jwt.SignOptions,
    );
    res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (err) {
    throw err;
  }
};

export const seedAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, secretKey } = req.body as {
      email?: string;
      password?: string;
      secretKey?: string;
    };
    if (secretKey !== process.env.ADMIN_SEED_KEY) {
      res.status(403).json({ error: 'Invalid secret key' });
      return;
    }
    if (!email || !password) {
      res.status(400).json({ error: 'email và password bắt buộc' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
      res.json({ message: 'User promoted to ADMIN' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, fullName: 'Admin', role: 'ADMIN' },
    });
    res.status(201).json({ message: 'Admin created', id: user.id });
  } catch (err) {
    throw err;
  }
};
