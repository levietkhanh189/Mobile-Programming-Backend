import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export default router;
