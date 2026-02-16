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
            createdAt: new Date().toISOString(),
        },
        {
            id: 2,
            name: 'God of War Ragnarok',
            description: 'Kratos và Atreus đối đầu với các vị thần Bắc Âu.',
            price: 69.99,
            category: 'Action',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4Eps9un9U789WaSAnkP9S69W.png',
            createdAt: new Date().toISOString(),
        },
        {
            id: 3,
            name: 'Ghost of Tsushima',
            description: 'Hành trình của samurai cuối cùng trên đảo Tsushima.',
            price: 49.99,
            category: 'Action',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202106/2321/3cWaSAnkP9S69WaSAnkP9S69.png',
            createdAt: new Date().toISOString(),
        },
        {
            id: 4,
            name: 'The Last of Us Part II',
            description: 'Câu chuyện đầy cảm xúc về sự trừng phạt và tha thứ.',
            price: 39.99,
            category: 'Adventure',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202005/2610/9WaSAnkP9S69WaSAnkP9S69W.png',
            createdAt: new Date().toISOString(),
        },
        {
            id: 5,
            name: 'Horizon Forbidden West',
            description: 'Aloy khám phá vùng đất phía Tây đầy nguy hiểm.',
            price: 49.99,
            category: 'RPG',
            image: 'https://image.api.playstation.com/vulcan/ap/rnd/202108/2410/6WaSAnkP9S69WaSAnkP9S69W.png',
            createdAt: new Date().toISOString(),
        },
    ];

    findAll(search?: string, category?: string): Product[] {
        let filtered = this.products;

        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
        }

        if (category && category !== 'All') {
            filtered = filtered.filter(p => p.category === category);
        }

        return filtered;
    }

    findById(id: number): Product | undefined {
        return this.products.find(p => p.id === id);
    }
}

export const productStorage = new ProductStorage();
