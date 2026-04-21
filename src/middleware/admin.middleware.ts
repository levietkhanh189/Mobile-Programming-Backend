import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express.types';
import prisma from '../config/database';

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      res.status(403).json({ error: 'Không có quyền truy cập admin' });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
};
