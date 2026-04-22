import { SePayPgClient } from 'sepay-pg-node';
import {
  SEPAY_MERCHANT_ID,
  SEPAY_SECRET_KEY,
  SEPAY_ENV,
  USD_TO_VND_RATE,
  PUBLIC_BASE_URL,
} from '../config/constants';
import type {
  SepayCheckoutFields,
  SepayIpnPayload,
} from '../types/sepay.types';

// Singleton SePay SDK client. SDK handles HMAC SHA256 signing internally.
const client = new SePayPgClient({
  env: SEPAY_ENV,
  merchant_id: SEPAY_MERCHANT_ID,
  secret_key: SEPAY_SECRET_KEY,
});

// SePay checkout endpoint URL (sandbox or production)
const checkoutActionUrl: string = client.checkout.initCheckoutUrl();

export interface BuildCheckoutInput {
  orderId: string;
  amountUsd: number;
  description?: string;
}

export interface BuildCheckoutResult {
  actionUrl: string;
  fields: SepayCheckoutFields;
  invoiceNumber: string;
  amountVnd: number;
}

// Convert USD amount to VND using fixed rate (rounded to integer VND).
// SePay requires integer VND amounts.
export function usdToVnd(amountUsd: number): number {
  return Math.round(amountUsd * USD_TO_VND_RATE);
}

// Build signed checkout fields the frontend can POST to actionUrl via WebView form.
export function buildCheckoutFields(input: BuildCheckoutInput): BuildCheckoutResult {
  const amountVnd = usdToVnd(input.amountUsd);
  // Use our order id + timestamp to keep invoice number unique even on retry.
  const invoiceNumber = `${input.orderId}-${Date.now()}`;

  const fields = client.checkout.initOneTimePaymentFields({
    operation: 'PURCHASE',
    payment_method: 'BANK_TRANSFER',
    order_invoice_number: invoiceNumber,
    order_amount: amountVnd,
    currency: 'VND',
    order_description: input.description || `Order ${input.orderId}`,
    success_url: `${PUBLIC_BASE_URL}/api/payments/sepay/return?status=success&orderId=${encodeURIComponent(input.orderId)}`,
    error_url: `${PUBLIC_BASE_URL}/api/payments/sepay/return?status=error&orderId=${encodeURIComponent(input.orderId)}`,
    cancel_url: `${PUBLIC_BASE_URL}/api/payments/sepay/return?status=cancel&orderId=${encodeURIComponent(input.orderId)}`,
  }) as unknown as SepayCheckoutFields;

  return {
    actionUrl: checkoutActionUrl,
    fields,
    invoiceNumber,
    amountVnd,
  };
}

// Verify IPN payload signature by re-signing the payload fields with SDK and comparing.
// Returns true if signature matches, false otherwise. If SDK exposes dedicated verify,
// prefer that — currently we rely on signFields with the same field order.
export function verifyIpnSignature(payload: SepayIpnPayload): boolean {
  const incomingSig = payload.signature;
  if (!incomingSig) return false;

  try {
    const { signature: _drop, ...rest } = payload;
    // SDK's signFields is public — use it to reproduce signature.
    const expected = (client.checkout as any).signFields?.(rest);
    if (!expected) return false;
    return expected === incomingSig;
  } catch {
    return false;
  }
}

// Interpret IPN payload → simple PAID / FAILED / CANCELLED flag for our Order table.
export function mapIpnToStatus(payload: SepayIpnPayload): 'PAID' | 'FAILED' | 'CANCELLED' {
  const type = payload.notification_type;
  if (type === 'ORDER_PAID') return 'PAID';
  const txStatus = (payload.transaction?.status || '').toUpperCase();
  if (txStatus === 'CANCELLED' || txStatus === 'CANCELED') return 'CANCELLED';
  return 'FAILED';
}
