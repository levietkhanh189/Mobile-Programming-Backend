import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { getProductReviews } from '../controllers/review.controller';

const router = Router();

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/top-sellers', productController.getTopSellers);
router.get('/discounts', productController.getDiscountedProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/reviews', getProductReviews);
router.get('/:id/related', productController.getRelatedProducts);

export default router;
