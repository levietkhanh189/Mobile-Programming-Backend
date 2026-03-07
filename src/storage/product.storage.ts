import prisma from '../config/database';
import { Product } from '../types/product.types';

class ProductStorage {
  async findAll(
    search?: string,
    category?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ products: Product[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category && category !== 'All') {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { products: products.map(this.toProduct), total };
  }

  async findById(id: number): Promise<Product | undefined> {
    const product = await prisma.product.findUnique({ where: { id } });
    return product ? this.toProduct(product) : undefined;
  }

  async getCategories(): Promise<string[]> {
    const results = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return results.map((r) => r.category);
  }

  async getTopSellers(limit: number = 10): Promise<Product[]> {
    const products = await prisma.product.findMany({
      orderBy: { soldCount: 'desc' },
      take: limit,
    });
    return products.map(this.toProduct);
  }

  async getDiscountedProducts(limit: number = 20): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { discountPercentage: { gt: 0 } },
      orderBy: { discountPercentage: 'desc' },
      take: limit,
    });
    return products.map(this.toProduct);
  }

  private toProduct(row: { id: number; name: string; description: string; price: number; category: string; image: string; soldCount: number; discountPercentage: number; createdAt: Date }): Product {
    return {
      ...row,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

export const productStorage = new ProductStorage();
