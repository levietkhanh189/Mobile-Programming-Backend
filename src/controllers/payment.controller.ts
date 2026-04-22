import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express.types';
import { orderStorage } from '../storage/order.storage';
import {
  buildCheckoutFields,
  verifyIpnSignature,
  mapIpnToStatus,
} from '../services/sepay.service';
import { SepayIpnPayload } from '../types/sepay.types';

// POST /api/payments/sepay/create — authenticated
// Body: { orderId: string }
// Returns form fields + action URL for FE to POST via WebView.
export async function createCheckout(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.body as { orderId?: string };

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });

    const order = await orderStorage.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.userId !== userId)
      return res.status(403).json({ success: false, message: 'Forbidden' });
    if (order.status !== 'Pending')
      return res.status(400).json({ success: false, message: `Order already ${order.status}` });

    // totalAmount on Order is in USD (frontend operates in USD).
    const result = buildCheckoutFields({
      orderId: order.id,
      amountUsd: order.totalAmount,
      description: `Payment for order ${order.id}`,
    });

    await orderStorage.attachSepayCheckout(order.id, result.invoiceNumber, result.amountVnd);

    return res.json({
      success: true,
      actionUrl: result.actionUrl,
      fields: result.fields,
      invoiceNumber: result.invoiceNumber,
      amountVnd: result.amountVnd,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/sepay/webhook — public (called by SePay servers)
// Verifies HMAC signature, then updates order sepayStatus + order.status.
export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = req.body as SepayIpnPayload;
    if (!payload || !payload.notification_type) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const valid = verifyIpnSignature(payload);
    if (!valid) {
      // Log but respond 200 to avoid repeated retries while we debug sandbox.
      // eslint-disable-next-line no-console
      console.warn('[sepay] webhook signature invalid', {
        invoice: payload.order?.invoice_number,
      });
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const invoiceNumber =
      payload.order?.invoice_number ||
      payload.order?.order_id ||
      payload.order?.id;
    if (!invoiceNumber) {
      return res.status(400).json({ success: false, message: 'Missing invoice_number' });
    }

    const order = await orderStorage.findBySepayInvoice(invoiceNumber);
    if (!order) {
      // eslint-disable-next-line no-console
      console.warn('[sepay] order not found for invoice', invoiceNumber);
      // Still ack 200 so SePay does not retry indefinitely on stale/replayed events.
      return res.status(200).json({ success: true, ignored: true });
    }

    const sepayStatus = mapIpnToStatus(payload);
    await orderStorage.updateSepayStatus(order.id, sepayStatus);

    // eslint-disable-next-line no-console
    console.log('[sepay] webhook applied', {
      orderId: order.id,
      sepayStatus,
      type: payload.notification_type,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/payments/sepay/status/:orderId — authenticated (FE polls this)
export async function getStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.userId;
    const orderId = String(req.params.orderId ?? '');

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const order = await orderStorage.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.userId !== userId)
      return res.status(403).json({ success: false, message: 'Forbidden' });

    return res.json({
      success: true,
      orderId: order.id,
      orderStatus: order.status,
      sepayStatus: (order as any).sepayStatus ?? null,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/payments/sepay/return — user-facing redirect target from SePay
// SePay redirects here with ?status=success|error|cancel&orderId=...
// Returns a tiny HTML that posts a message so WebView can close on FE side.
export function handleReturn(req: Request, res: Response) {
  const status = String(req.query.status ?? 'unknown');
  const orderId = String(req.query.orderId ?? '');
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>SePay Return</title></head>
<body style="font-family:system-ui;padding:24px;text-align:center">
  <h2>Payment ${status}</h2>
  <p>Order: ${orderId}</p>
  <p>You can close this window and return to the app.</p>
  <script>
    try {
      const msg = JSON.stringify({ type: 'sepay_return', status: ${JSON.stringify(status)}, orderId: ${JSON.stringify(orderId)} });
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
    } catch (e) {}
  </script>
</body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
