import prisma from '../config/database';
import { Order } from '../types/order.types';

class OrderStorage {
  async create(
    userId: number,
    items: { productId: number; quantity: number }[],
    shippingAddress: string,
  ): Promise<Order> {
    // Fetch product details for each item
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const orderItems = items.map((item) => {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const orderId = `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId,
        totalAmount,
        shippingAddress,
        paymentMethod: 'COD',
        status: 'Pending',
        items: { create: orderItems },
      },
      include: { items: true },
    });

    return this.toOrder(order);
  }

  async findByUser(userId: number): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o: any) => this.toOrder(o));
  }

  async findById(id: string): Promise<Order | undefined> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return order ? this.toOrder(order) : undefined;
  }

  async cancel(
    id: string,
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    const order = await this.findById(id);
    if (!order) return { success: false, message: 'Order not found' };
    if (order.userId !== userId)
      return { success: false, message: 'Unauthorized' };

    const diffMinutes =
      (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
    if (diffMinutes > 30) {
      return {
        success: false,
        message: 'Cannot cancel order after 30 minutes',
      };
    }

    if (order.status !== 'Pending' && order.status !== 'Confirmed') {
      return {
        success: false,
        message: `Cannot cancel order in ${order.status} status`,
      };
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'Cancelled' },
    });

    return { success: true, message: 'Order cancelled successfully' };
  }

  private toOrder(row: {
    id: string;
    userId: number;
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    items: { productId: number; name: string; price: number; quantity: number; image: string }[];
  }): Order {
    return {
      id: row.id,
      userId: row.userId,
      items: row.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      totalAmount: row.totalAmount,
      shippingAddress: row.shippingAddress,
      paymentMethod: row.paymentMethod as 'COD',
      status: row.status as Order['status'],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

export const orderStorage = new OrderStorage();
