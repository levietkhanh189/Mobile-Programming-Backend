import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/register', authController.register);
router.post('/register-simple', authController.registerSimple);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);

export default router;
