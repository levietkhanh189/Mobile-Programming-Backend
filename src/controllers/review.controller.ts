import { Request, Response } from 'express';
import { reviewStorage } from '../storage/review.storage';
import { userStorage } from '../storage/user.storage';
import { AuthRequest } from '../types/express.types';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user!.userId;

    if (!productId || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'productId và rating (1-5) bắt buộc' });
      return;
    }

    const alreadyReviewed = await reviewStorage.existsByUserAndProduct(userId, productId);
    if (alreadyReviewed) {
      res.status(409).json({ error: 'Bạn đã đánh giá sản phẩm này rồi' });
      return;
    }

    const review = await reviewStorage.create(userId, { productId, rating, comment });
    await userStorage.addPoints(userId, 10);

    res.status(201).json({ review, pointsEarned: 10 });
  } catch (err) {
    throw err;
  }
};

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params['id'] as string);
    const reviews = await reviewStorage.findByProduct(productId);
    const averageRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (err) {
    throw err;
  }
};
