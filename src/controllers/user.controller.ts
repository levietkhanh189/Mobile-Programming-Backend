import { Response } from 'express';
import { AuthRequest } from '../types/express.types';
import { getUserById } from '../services/user.service';

export function getProfile(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
      return;
    }

    const user = getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'User not found.',
    });
  }
}
