export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipping' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'COD' | 'SEPAY';
export type SepayOrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

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
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    sepayInvoiceNumber?: string | null;
    sepayStatus?: SepayOrderStatus | null;
    sepayAmountVnd?: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderRequest {
    items: { productId: number; quantity: number }[];
    shippingAddress: string;
    paymentMethod?: PaymentMethod;
}
