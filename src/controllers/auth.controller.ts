import { Request, Response } from 'express';
import { isValidEmail } from '../utils/validation.utils';
import { sendOTP as sendOTPService, verifyOTP as verifyOTPService } from '../services/otp.service';
import { registerUser, loginUser } from '../services/auth.service';
import { resetPassword as resetPasswordService } from '../services/user.service';
import { userStorage } from '../storage/user.storage';
import { SendOTPRequest, VerifyOTPRequest } from '../types/otp.types';
import { RegisterRequest, LoginRequest } from '../types/user.types';
import { ResetPasswordRequest } from '../types/auth.types';

export async function sendOTP(req: Request, res: Response): Promise<void> {
  try {
    const { email, purpose } = req.body as SendOTPRequest;

    // Validate input
    if (!email || !purpose) {
      res.status(400).json({
        success: false,
        message: 'Email and purpose are required.',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
      return;
    }

    if (purpose !== 'register' && purpose !== 'forgot-password') {
      res.status(400).json({
        success: false,
        message: 'Purpose must be either "register" or "forgot-password".',
      });
      return;
    }

    // For register: check if email already exists
    if (purpose === 'register') {
      const existingUser = userStorage.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already registered.',
        });
        return;
      }
    }

    // For forgot-password: check if email exists
    if (purpose === 'forgot-password') {
      const existingUser = userStorage.findByEmail(email);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'No account found with this email.',
        });
        return;
      }
    }

    // Send OTP
    const result = await sendOTPService(email, purpose);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully! Check your email.',
      purpose,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP.',
    });
  }
}

export function verifyOTP(req: Request, res: Response): void {
  try {
    const { email, otp } = req.body as VerifyOTPRequest;

    // Validate input
    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
      return;
    }

    // Verify OTP
    verifyOTPService(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully!',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP.',
    });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, fullName, phone } = req.body as RegisterRequest;

    // Validate input
    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required.',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    // Register user (requires OTP verification)
    const result = await registerUser({ email, password, fullName, phone }, true);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed.',
    });
  }
}

export async function registerSimple(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, fullName, phone } = req.body as RegisterRequest;

    // Validate input
    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required.',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    // Register user (no OTP required)
    const result = await registerUser({ email, password, fullName, phone }, false);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed.',
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    // Login user
    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed.',
    });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, newPassword } = req.body as ResetPasswordRequest;

    // Validate input
    if (!email || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Email and new password are required.',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    // Reset password
    await resetPasswordService(email, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Password reset failed.',
    });
  }
}
