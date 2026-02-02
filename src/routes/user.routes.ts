import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/change-password', authenticateToken, userController.changePassword);

router.post('/request-update-email', authenticateToken, userController.requestUpdateEmail);
router.post('/verify-update-email', authenticateToken, userController.verifyUpdateEmail);

router.post('/request-update-phone', authenticateToken, userController.requestUpdatePhone);
router.post('/verify-update-phone', authenticateToken, userController.verifyUpdatePhone);

export default router;
