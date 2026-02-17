import { Request, Response } from 'express';
import { productStorage } from '../storage/product.storage';

export function getProducts(req: Request, res: Response): void {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        const category = typeof req.query.category === 'string' ? req.query.category : undefined;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const { products, total } = productStorage.findAll(search, category, page, limit);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm.',
        });
    }
}

export function getProductById(req: Request, res: Response): void {
    try {
        const idParam = req.params.id as string;
        const id = parseInt(idParam);
        const product = productStorage.findById(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm.',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết sản phẩm.',
        });
    }
}

export function getCategories(_req: Request, res: Response): void {
    try {
        const categories = productStorage.getCategories();
        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách category.',
        });
    }
}

export function getTopSellers(_req: Request, res: Response): void {
    try {
        const products = productStorage.getTopSellers(10);
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm bán chạy.',
        });
    }
}

export function getDiscountedProducts(_req: Request, res: Response): void {
    try {
        const products = productStorage.getDiscountedProducts(20);
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm giảm giá.',
        });
    }
}
