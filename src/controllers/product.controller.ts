import { Request, Response } from 'express';
import { productStorage } from '../storage/product.storage';
import prisma from '../config/database';

export async function getProducts(req: Request, res: Response): Promise<void> {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        const category = typeof req.query.category === 'string' ? req.query.category : undefined;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const { products, total } = await productStorage.findAll(search, category, page, limit);

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
            message: 'Loi khi lay danh sach san pham.',
        });
    }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
    try {
        const idParam = req.params.id as string;
        const id = parseInt(idParam);
        const product = await productStorage.findById(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Khong tim thay san pham.',
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
            message: 'Loi khi lay chi tiet san pham.',
        });
    }
}

export async function getCategories(_req: Request, res: Response): Promise<void> {
    try {
        const categories = await productStorage.getCategories();
        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Loi khi lay danh sach category.',
        });
    }
}

export async function getTopSellers(_req: Request, res: Response): Promise<void> {
    try {
        const products = await productStorage.getTopSellers(10);
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Loi khi lay danh sach san pham ban chay.',
        });
    }
}

export async function getDiscountedProducts(_req: Request, res: Response): Promise<void> {
    try {
        const products = await productStorage.getDiscountedProducts(20);
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Loi khi lay danh sach san pham giam gia.',
        });
    }
}

export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params['id'] as string);
        const limit = parseInt(req.query['limit'] as string) || 10;
        const product = await productStorage.findById(id);
        if (!product) {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
            return;
        }
        const related = await prisma.product.findMany({
            where: { category: product.category, id: { not: id } },
            orderBy: { soldCount: 'desc' },
            take: limit,
        });
        res.json({ products: related });
    } catch (err) {
        throw err;
    }
};
