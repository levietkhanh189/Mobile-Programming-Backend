import { Request, Response } from 'express';
import prisma from '../config/database';

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const search = (req.query['search'] as string) || '';
    const category = (req.query['category'] as string) || '';
    const where: { name?: { contains: string; mode: 'insensitive' }; category?: string } = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (category) where.category = category;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ products, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    throw err;
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { reviews: true, orderItems: true } } },
    });
    if (!product) {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
      return;
    }
    res.json({ product });
  } catch (err) {
    throw err;
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, image, soldCount, discountPercentage } =
      req.body as {
        name?: string;
        description?: string;
        price?: number | string;
        category?: string;
        image?: string;
        soldCount?: number;
        discountPercentage?: number;
      };
    if (!name || price === undefined || !category) {
      res.status(400).json({ error: 'name, price, category bắt buộc' });
      return;
    }
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(String(price)),
        category,
        image: image || '',
        soldCount: soldCount || 0,
        discountPercentage: discountPercentage || 0,
      },
    });
    res.status(201).json({ product });
  } catch (err) {
    throw err;
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const { name, description, price, category, image, soldCount, discountPercentage } =
      req.body as {
        name?: string;
        description?: string;
        price?: number | string;
        category?: string;
        image?: string;
        soldCount?: number;
        discountPercentage?: number;
      };
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(String(price)) }),
        ...(category && { category }),
        ...(image !== undefined && { image }),
        ...(soldCount !== undefined && { soldCount }),
        ...(discountPercentage !== undefined && { discountPercentage }),
      },
    });
    res.json({ product });
  } catch (err) {
    throw err;
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};
