import { Request, Response } from 'express';
import prisma from '../config/database';

export const listCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ coupons });
  } catch (err) {
    throw err;
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discount, minOrder, maxDiscount, expiresAt, maxUsage } = req.body as {
      code?: string;
      discount?: number | string;
      minOrder?: number | string;
      maxDiscount?: number | string;
      expiresAt?: string;
      maxUsage?: number | string;
    };
    if (!code || discount === undefined) {
      res.status(400).json({ error: 'code và discount bắt buộc' });
      return;
    }
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(String(discount)),
        minOrder: minOrder ? parseFloat(String(minOrder)) : 0,
        maxDiscount: maxDiscount ? parseFloat(String(maxDiscount)) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUsage: maxUsage ? parseInt(String(maxUsage)) : null,
      },
    });
    res.status(201).json({ coupon });
  } catch (err) {
    throw err;
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const { code, discount, minOrder, maxDiscount, expiresAt, maxUsage, isActive } =
      req.body as {
        code?: string;
        discount?: number;
        minOrder?: number;
        maxDiscount?: number | null;
        expiresAt?: string | null;
        maxUsage?: number | null;
        isActive?: boolean;
      };
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(discount !== undefined && { discount }),
        ...(minOrder !== undefined && { minOrder }),
        ...(maxDiscount !== undefined && { maxDiscount }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(maxUsage !== undefined && { maxUsage }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ coupon });
  } catch (err) {
    throw err;
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    await prisma.coupon.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};

export const toggleCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy coupon' });
      return;
    }
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    res.json({ coupon });
  } catch (err) {
    throw err;
  }
};
