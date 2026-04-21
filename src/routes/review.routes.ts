import { Router } from 'express';
import { createReview, getProductReviews } from '../controllers/review.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, createReview);
// Note: GET /:productId/reviews is mounted on product routes for RESTful design
router.get('/:productId', getProductReviews);

export default router;
