import { Response } from 'express';
import { AuthRequest } from '../types/express.types';
import * as userService from '../services/user.service';
import * as otpService from '../services/otp.service';
import { isValidEmail } from '../utils/validation.utils';

export function getProfile(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = userService.getUserById(req.user.userId);
    res.status(200).json({ success: true, message: 'Profile retrieved successfully.', user });
  } catch (error) {
    res.status(404).json({ success: false, message: error instanceof Error ? error.message : 'User not found.' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { fullName, avatar } = req.body;
    const user = userService.updateProfile(req.user.userId, { fullName, avatar });

    res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Update failed.' });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu cũ và mới.' });
      return;
    }

    await userService.changePassword(req.user.userId, oldPassword, newPassword);
    res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Đổi mật khẩu thất bại.' });
  }
}

export async function requestUpdateEmail(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { newEmail } = req.body;
    if (!newEmail || !isValidEmail(newEmail)) {
      res.status(400).json({ success: false, message: 'Email mới không hợp lệ.' });
      return;
    }

    const result = await otpService.sendOTP(newEmail, 'update-email');
    res.status(200).json({ success: true, message: 'Mã OTP đã được gửi đến email mới.', expiresIn: result.expiresIn });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Gửi mã OTP thất bại.' });
  }
}

export async function verifyUpdateEmail(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { newEmail, otp } = req.body;
    if (!newEmail || !otp) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập Email mới và mã OTP.' });
      return;
    }

    const user = userService.updateEmail(req.user.userId, newEmail);
    res.status(200).json({ success: true, message: 'Cập nhật Email thành công.', user });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Xác thực Email thất bại.' });
  }
}

export async function requestUpdatePhone(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { newPhone } = req.body;
    if (!newPhone) {
      res.status(400).json({ success: false, message: 'Số điện thoại mới là bắt buộc.' });
      return;
    }

    // Reuse sendOTP for phone (using phone number as the key in otpStorage)
    const result = await otpService.sendOTP(newPhone, 'update-phone');
    res.status(200).json({ success: true, message: 'Mã OTP đã được gửi đến số điện thoại mới.', expiresIn: result.expiresIn });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Gửi mã OTP thất bại.' });
  }
}

export async function verifyUpdatePhone(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { newPhone, otp } = req.body;
    if (!newPhone || !otp) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập SĐT mới và mã OTP.' });
      return;
    }

    const user = userService.updatePhone(req.user.userId, newPhone);
    res.status(200).json({ success: true, message: 'Cập nhật Số điện thoại thành công.', user });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Xác thực Số điện thoại thất bại.' });
  }
}
