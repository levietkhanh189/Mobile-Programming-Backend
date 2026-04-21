import { Request, Response } from 'express';
import prisma from '../config/database';

export const getSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const all = await prisma.order.findMany({ where: { status: 'Delivered' } });
    const filter = (from: Date) => all.filter((o) => o.createdAt >= from);
    const calc = (arr: typeof all) => ({
      orders: arr.length,
      revenue: arr.reduce((s, o) => s + o.totalAmount, 0),
    });

    const byStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    res.json({
      today: calc(filter(startOfDay)),
      thisWeek: calc(filter(startOfWeek)),
      thisMonth: calc(filter(startOfMonth)),
      total: calc(all),
      byStatus,
    });
  } catch (err) {
    throw err;
  }
};

export const getDailyRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const from = req.query['from']
      ? new Date(req.query['from'] as string)
      : new Date(Date.now() - 30 * 86400000);
    const to = req.query['to'] ? new Date(req.query['to'] as string) : new Date();

    const orders = await prisma.order.findMany({
      where: { status: 'Delivered', createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: 'asc' },
    });

    const map = new Map<string, { orders: number; revenue: number }>();
    orders.forEach((o) => {
      const date = o.createdAt.toISOString().split('T')[0] as string;
      const entry = map.get(date) ?? { orders: 0, revenue: 0 };
      entry.orders++;
      entry.revenue += o.totalAmount;
      map.set(date, entry);
    });

    res.json({
      daily: Array.from(map.entries()).map(([date, data]) => ({ date, ...data })),
    });
  } catch (err) {
    throw err;
  }
};

export const getTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 10;
    const products = await prisma.product.findMany({
      orderBy: { soldCount: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        soldCount: true,
        image: true,
      },
    });
    res.json({
      products: products.map((p) => ({ ...p, totalRevenue: p.price * p.soldCount })),
    });
  } catch (err) {
    throw err;
  }
};
