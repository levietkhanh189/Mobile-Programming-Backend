import { Request, Response } from 'express';
import { orderStorage } from '../storage/order.storage';
import { addressStorage } from '../storage/address.storage';

const getCurrentUserId = (req: any) => req.user?.userId || req.user?.id || 1;

const formatAddress = (a: { fullName: string; phone: string; address: string; city: string }) =>
    `${a.fullName} - ${a.phone} - ${a.address}, ${a.city}`;

export async function checkout(req: Request, res: Response): Promise<void> {
    try {
        const userId = getCurrentUserId(req);
        const { items, shippingAddress, addressId, paymentMethod } = req.body;

        if (!items || !items.length) {
            res.status(400).json({ success: false, message: 'Invalid order data' });
            return;
        }

        let finalAddress: string | undefined;
        if (addressId) {
            const addr = await addressStorage.findById(Number(addressId), userId);
            if (!addr) {
                res.status(400).json({ success: false, message: 'Address not found' });
                return;
            }
            finalAddress = formatAddress(addr);
        } else if (typeof shippingAddress === 'string' && shippingAddress.trim()) {
            finalAddress = shippingAddress.trim();
        }

        if (!finalAddress) {
            res.status(400).json({ success: false, message: 'Invalid order data' });
            return;
        }

        const method = paymentMethod === 'SEPAY' ? 'SEPAY' : 'COD';
        const order = await orderStorage.create(userId, items, finalAddress, method);
        res.status(201).json({ success: true, data: order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error creating order' });
    }
}

export async function getOrderHistory(req: Request, res: Response): Promise<void> {
    try {
        const userId = getCurrentUserId(req);
        const orders = await orderStorage.findByUser(userId);
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching order history' });
    }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
    try {
        const userId = getCurrentUserId(req);
        const id = req.params.id as string;
        const order = await orderStorage.findById(id);

        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        if (order.userId !== userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching order' });
    }
}

export async function cancelOrder(req: Request, res: Response): Promise<void> {
    try {
        const userId = getCurrentUserId(req);
        const id = req.params.id as string;
        const result = await orderStorage.cancel(id, userId);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cancelling order' });
    }
}
