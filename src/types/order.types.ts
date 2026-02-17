export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipping' | 'Delivered' | 'Cancelled';

export interface OrderItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    id: string;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: 'COD';
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderRequest {
    items: { productId: number; quantity: number }[];
    shippingAddress: string;
}
