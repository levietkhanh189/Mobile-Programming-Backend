import { Response } from 'express';
import { AuthRequest } from '../types/express.types';
import { addressStorage } from '../storage/address.storage';
import { orderStorage } from '../storage/order.storage';
import prisma from '../config/database';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await orderStorage.getStatsByUser(req.user!.userId);
    res.json(stats);
  } catch (err) {
    throw err;
  }
};

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addresses = await addressStorage.findByUser(req.user!.userId);
    res.json({ addresses });
  } catch (err) {
    throw err;
  }
};

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { label, fullName, phone, address, city, district, ward, zipCode } = req.body;
    if (!fullName || !phone || !address || !city) {
      res.status(400).json({ error: 'fullName, phone, address, city bắt buộc' });
      return;
    }
    const newAddress = await addressStorage.create(req.user!.userId, { label, fullName, phone, address, city, district, ward, zipCode });
    res.status(201).json({ address: newAddress });
  } catch (err) {
    throw err;
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const updated = await addressStorage.update(id, req.user!.userId, req.body);
    res.json({ address: updated });
  } catch (err) {
    throw err;
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    await addressStorage.delete(id, req.user!.userId);
    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const address = await addressStorage.setDefault(id, req.user!.userId);
    res.json({ address });
  } catch (err) {
    throw err;
  }
};

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user!.userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products: items.map((i) => i.product) });
  } catch (err) {
    throw err;
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ error: 'productId bắt buộc' });
      return;
    }
    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: req.user!.userId, productId } },
      create: { userId: req.user!.userId, productId },
      update: {},
    });
    res.status(201).json({ wishlist: item });
  } catch (err) {
    throw err;
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params['productId'] as string);
    await prisma.wishlist.delete({
      where: { userId_productId: { userId: req.user!.userId, productId } },
    });
    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};
