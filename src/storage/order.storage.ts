import { Order } from '../types/order.types';
import { productStorage } from './product.storage';

class OrderStorage {
    private orders: Order[] = [];

    create(userId: number, items: { productId: number; quantity: number }[], shippingAddress: string): Order {
        const orderItems = items.map(item => {
            const product = productStorage.findById(item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found`);
            return {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image
            };
        });

        const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod: 'COD',
            status: 'Pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.orders.push(newOrder);
        return newOrder;
    }

    findByUser(userId: number): Order[] {
        return this.orders.filter(o => o.userId === userId).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    findById(id: string): Order | undefined {
        return this.orders.find(o => o.id === id);
    }

    cancel(id: string, userId: number): { success: boolean, message: string } {
        const order = this.findById(id);
        if (!order) return { success: false, message: 'Order not found' };
        if (order.userId !== userId) return { success: false, message: 'Unauthorized' };

        const createdAt = new Date(order.createdAt).getTime();
        const now = Date.now();
        const diffMinutes = (now - createdAt) / (1000 * 60);

        if (diffMinutes > 30) {
            return { success: false, message: 'Cannot cancel order after 30 minutes' };
        }

        if (order.status !== 'Pending' && order.status !== 'Confirmed') {
            return { success: false, message: `Cannot cancel order in ${order.status} status` };
        }

        order.status = 'Cancelled';
        order.updatedAt = new Date().toISOString();
        return { success: true, message: 'Order cancelled successfully' };
    }
}

export const orderStorage = new OrderStorage();
