export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  user?: { fullName: string; avatar?: string };
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  comment?: string;
}
