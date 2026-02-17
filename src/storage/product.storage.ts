import { Product } from '../types/product.types';

class ProductStorage {
    private products: Product[] = [
        {
            id: 1,
            name: 'Elden Ring',
            description: 'Hành trình khám phá Elden Ring đầy thử thách.',
            price: 59.99,
            category: 'RPG',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aajm8sYvSAnkP9S9pS69WSAn.png',
            soldCount: 1500,
            discountPercentage: 10,
            createdAt: new Date().toISOString(),
        },
        {
            id: 2,
            name: 'God of War Ragnarok',
            description: 'Kratos và Atreus đối đầu với các vị thần Bắc Âu.',
            price: 69.99,
            category: 'Action',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4Eps9un9U789WaSAnkP9S69W.png',
            soldCount: 2500,
            discountPercentage: 0,
            createdAt: new Date().toISOString(),
        },
        {
            id: 3,
            name: 'Ghost of Tsushima',
            description: 'Hành trình của samurai cuối cùng trên đảo Tsushima.',
            price: 49.99,
            category: 'Action',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202106/2321/3cWaSAnkP9S69WaSAnkP9S69.png',
            soldCount: 1800,
            discountPercentage: 15,
            createdAt: new Date().toISOString(),
        },
        {
            id: 4,
            name: 'The Last of Us Part II',
            description: 'Câu chuyện đầy cảm xúc về sự trừng phạt và tha thứ.',
            price: 39.99,
            category: 'Adventure',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202005/2610/9WaSAnkP9S69WaSAnkP9S69W.png',
            soldCount: 3000,
            discountPercentage: 50,
            createdAt: new Date().toISOString(),
        },
        {
            id: 5,
            name: 'Horizon Forbidden West',
            description: 'Aloy khám phá vùng đất phía Tây đầy nguy hiểm.',
            price: 49.99,
            category: 'RPG',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202108/2410/6WaSAnkP9S69WaSAnkP9S69W.png',
            soldCount: 1200,
            discountPercentage: 20,
            createdAt: new Date().toISOString(),
        },
        // Adding more mock data for lists
        ...Array.from({ length: 25 }).map((_, i) => ({
            id: i + 6,
            name: `Product ${i + 6}`,
            description: `Mô tả cho sản phẩm thứ ${i + 6}`,
            price: Math.floor(Math.random() * 100) + 10,
            category: ['Action', 'RPG', 'Adventure', 'Strategy', 'Indie'][Math.floor(Math.random() * 5)],
            image: `https://picsum.photos/seed/${i + 6}/400/300`,
            soldCount: Math.floor(Math.random() * 2000),
            discountPercentage: Math.floor(Math.random() * 70),
            createdAt: new Date().toISOString(),
        }))
    ];

    findAll(search?: string, category?: string, page: number = 1, limit: number = 10): { products: Product[], total: number } {
        let filtered = this.products;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
        }

        if (category && category !== 'All') {
            filtered = filtered.filter(p => p.category === category);
        }

        const total = filtered.length;
        const start = (page - 1) * limit;
        const products = filtered.slice(start, start + limit);

        return { products, total };
    }

    findById(id: number): Product | undefined {
        return this.products.find(p => p.id === id);
    }

    getCategories(): string[] {
        const categories = this.products.map(p => p.category);
        return Array.from(new Set(categories));
    }

    getTopSellers(limit: number = 10): Product[] {
        return [...this.products]
            .sort((a, b) => b.soldCount - a.soldCount)
            .slice(0, limit);
    }

    getDiscountedProducts(limit: number = 20): Product[] {
        return [...this.products]
            .sort((a, b) => b.discountPercentage - a.discountPercentage)
            .slice(0, limit);
    }
}

export const productStorage = new ProductStorage();
