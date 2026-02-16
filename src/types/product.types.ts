export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    createdAt: string;
}

export interface ProductResponse {
    products: Product[];
    total: number;
}
