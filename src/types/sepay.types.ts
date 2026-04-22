// SePay payment gateway types (matching IPN payload contract from SePay docs)

export type SepayPaymentMethod = 'CARD' | 'BANK_TRANSFER';
export type SepayOperation = 'PURCHASE';
export type SepayStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface SepayCheckoutFields {
  operation: SepayOperation;
  payment_method: SepayPaymentMethod;
  order_invoice_number: string;
  order_amount: number;
  currency: 'VND';
  order_description?: string;
  success_url?: string;
  error_url?: string;
  cancel_url?: string;
  merchant: string;
  signature: string;
}

export interface CreateSepayCheckoutRequest {
  orderId: string; // our internal Order.id
}

export interface CreateSepayCheckoutResponse {
  success: boolean;
  // URL to POST the form to (SePay sandbox/prod checkout endpoint)
  actionUrl: string;
  // Form fields including signature — FE submits these as hidden inputs
  fields: SepayCheckoutFields;
  // Our internal tracking identifier
  invoiceNumber: string;
  amountVnd: number;
}

// IPN webhook payload (per SePay docs)
export interface SepayIpnPayload {
  timestamp?: string;
  notification_type: 'ORDER_PAID' | string;
  order?: {
    id?: string;
    order_id?: string;
    status?: string;
    amount?: number;
    invoice_number?: string;
    [k: string]: any;
  };
  transaction?: {
    id?: string;
    payment_method?: string;
    status?: string;
    amount?: number;
    [k: string]: any;
  };
  customer?: Record<string, any>;
  agreement?: Record<string, any>;
  signature?: string;
  [k: string]: any;
}
