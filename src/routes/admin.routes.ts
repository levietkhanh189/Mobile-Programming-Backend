import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { adminLogin, seedAdmin } from '../controllers/admin-auth.controller';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/admin-product.controller';
import {
  listOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/admin-order.controller';
import { listUsers, getUser, updateUserRole } from '../controllers/admin-user.controller';
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
} from '../controllers/admin-coupon.controller';
import {
  getSummary,
  getDailyRevenue,
  getTopProducts,
} from '../controllers/admin-revenue.controller';

const router = Router();
const auth = [authenticateToken, requireAdmin] as const;

// Auth (no admin check for login/seed)
router.post('/auth/login', adminLogin);
router.post('/auth/seed', seedAdmin);

// Products
router.get('/products', ...auth, listProducts);
router.post('/products', ...auth, createProduct);
router.get('/products/:id', ...auth, getProduct);
router.put('/products/:id', ...auth, updateProduct);
router.delete('/products/:id', ...auth, deleteProduct);

// Orders
router.get('/orders', ...auth, listOrders);
router.get('/orders/:id', ...auth, getOrder);
router.put('/orders/:id/status', ...auth, updateOrderStatus);

// Users
router.get('/users', ...auth, listUsers);
router.get('/users/:id', ...auth, getUser);
router.put('/users/:id/role', ...auth, updateUserRole);

// Coupons
router.get('/coupons', ...auth, listCoupons);
router.post('/coupons', ...auth, createCoupon);
router.put('/coupons/:id', ...auth, updateCoupon);
router.delete('/coupons/:id', ...auth, deleteCoupon);
router.patch('/coupons/:id/toggle', ...auth, toggleCoupon);

// Revenue
router.get('/revenue/summary', ...auth, getSummary);
router.get('/revenue/daily', ...auth, getDailyRevenue);
router.get('/revenue/top-products', ...auth, getTopProducts);

export default router;
