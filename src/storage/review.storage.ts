import prisma from '../config/database';
import { CreateReviewDto, Review } from '../types/review.types';

class ReviewStorage {
  async create(userId: number, data: CreateReviewDto): Promise<Review> {
    return prisma.review.create({
      data: { userId, productId: data.productId, rating: data.rating, comment: data.comment },
      include: { user: { select: { fullName: true, avatar: true } } },
    }) as unknown as Review;
  }

  async findByProduct(productId: number): Promise<Review[]> {
    return prisma.review.findMany({
      where: { productId },
      include: { user: { select: { fullName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Review[];
  }

  async existsByUserAndProduct(userId: number, productId: number): Promise<boolean> {
    const r = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!r;
  }
}

export const reviewStorage = new ReviewStorage();
