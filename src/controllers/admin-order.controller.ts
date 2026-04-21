import { Request, Response } from 'express';
import prisma from '../config/database';
import { getIO } from '../config/socket';

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const status = (req.query['status'] as string) || '';
    const where: { status?: string } = {};
    if (status) where.status = status;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    throw err;
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      return;
    }
    res.json({ order });
  } catch (err) {
    throw err;
  }
};

const VALID_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Delivered', 'Cancelled'];

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const { status } = req.body as { status?: string };
    if (!status || !VALID_STATUSES.includes(status)) {
      res
        .status(400)
        .json({ error: `Status phải là một trong: ${VALID_STATUSES.join(', ')}` });
      return;
    }
    const order = await prisma.order.update({ where: { id }, data: { status } });
    try {
      getIO()
        .to(`user:${order.userId}`)
        .emit('order:status_changed', {
          orderId: order.id,
          status: order.status,
          message: `Đơn hàng đã chuyển sang: ${status}`,
        });
    } catch {
      // socket not initialized — ignore
    }
    res.json({ order });
  } catch (err) {
    throw err;
  }
};
