import { Router } from 'express';
import * as payment from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Create SePay checkout for a pending order (returns form fields + action URL)
router.post('/sepay/create', authenticateToken as any, payment.createCheckout);

// IPN webhook from SePay — MUST be public, no JWT, verified by HMAC signature
router.post('/sepay/webhook', payment.handleWebhook);

// User-facing redirect target from SePay (success/error/cancel) — public, HTML response
router.get('/sepay/return', payment.handleReturn);

// FE polling endpoint — authenticated
router.get('/sepay/status/:orderId', authenticateToken as any, payment.getStatus);

export default router;
