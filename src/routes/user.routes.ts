import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';
import {
  getStats,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/user-extended.controller';

const router = Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/change-password', authenticateToken, userController.changePassword);

router.post('/request-update-email', authenticateToken, userController.requestUpdateEmail);
router.post('/verify-update-email', authenticateToken, userController.verifyUpdateEmail);

router.post('/request-update-phone', authenticateToken, userController.requestUpdatePhone);
router.post('/verify-update-phone', authenticateToken, userController.verifyUpdatePhone);

// Stats
router.get('/me/stats', authenticateToken, getStats);

// Addresses
router.get('/me/addresses', authenticateToken, getAddresses);
router.post('/me/addresses', authenticateToken, createAddress);
router.put('/me/addresses/:id', authenticateToken, updateAddress);
router.delete('/me/addresses/:id', authenticateToken, deleteAddress);
router.patch('/me/addresses/:id/default', authenticateToken, setDefaultAddress);

// Wishlist
router.get('/me/wishlist', authenticateToken, getWishlist);
router.post('/me/wishlist', authenticateToken, addToWishlist);
router.delete('/me/wishlist/:productId', authenticateToken, removeFromWishlist);

export default router;
