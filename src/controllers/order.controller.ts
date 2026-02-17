import { Request, Response } from 'express';
import { orderStorage } from '../storage/order.storage';

// Middleware should populate req.user, assuming it's done or using a fixed user for now
const getCurrentUserId = (req: any) => req.user?.id || 1;

export function checkout(req: Request, res: Response): void {
    try {
        const userId = getCurrentUserId(req);
        const { items, shippingAddress } = req.body;

        if (!items || !items.length || !shippingAddress) {
            res.status(400).json({ success: false, message: 'Invalid order data' });
            return;
        }

        const order = orderStorage.create(userId, items, shippingAddress);
        res.status(201).json({ success: true, data: order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error creating order' });
    }
}

export function getOrderHistory(req: Request, res: Response): void {
    try {
        const userId = getCurrentUserId(req);
        const orders = orderStorage.findByUser(userId);
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching order history' });
    }
}

export function cancelOrder(req: Request, res: Response): void {
    try {
        const userId = getCurrentUserId(req);
        const id = req.params.id as string;
        const result = orderStorage.cancel(id, userId);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cancelling order' });
    }
}
