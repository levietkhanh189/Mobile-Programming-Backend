import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/checkout', authenticateToken as any, orderController.checkout);
router.get('/history', authenticateToken as any, orderController.getOrderHistory);
router.delete('/:id', authenticateToken as any, orderController.cancelOrder);

export default router;
