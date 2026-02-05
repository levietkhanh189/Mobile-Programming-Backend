import { Router } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/top-sellers', productController.getTopSellers);
router.get('/discounts', productController.getDiscountedProducts);
router.get('/:id', productController.getProductById);

export default router;
