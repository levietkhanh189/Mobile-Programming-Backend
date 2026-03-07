import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const rawUrl = process.env.DATABASE_URL || '';
const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, '');

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: 'Elden Ring',
    description: 'Hanh trinh kham pha Elden Ring day thu thach.',
    price: 59.99,
    category: 'RPG',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aajm8sYvSAnkP9S9pS69WSAn.png',
    soldCount: 1500,
    discountPercentage: 10,
  },
  {
    name: 'God of War Ragnarok',
    description: 'Kratos va Atreus doi dau voi cac vi than Bac Au.',
    price: 69.99,
    category: 'Action',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4Eps9un9U789WaSAnkP9S69W.png',
    soldCount: 2500,
    discountPercentage: 0,
  },
  {
    name: 'Ghost of Tsushima',
    description: 'Hanh trinh cua samurai cuoi cung tren dao Tsushima.',
    price: 49.99,
    category: 'Action',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202106/2321/3cWaSAnkP9S69WaSAnkP9S69.png',
    soldCount: 1800,
    discountPercentage: 15,
  },
  {
    name: 'The Last of Us Part II',
    description: 'Cau chuyen day cam xuc ve su trung phat va tha thu.',
    price: 39.99,
    category: 'Adventure',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202005/2610/9WaSAnkP9S69WaSAnkP9S69W.png',
    soldCount: 3000,
    discountPercentage: 50,
  },
  {
    name: 'Horizon Forbidden West',
    description: 'Aloy kham pha vung dat phia Tay day nguy hiem.',
    price: 49.99,
    category: 'RPG',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202108/2410/6WaSAnkP9S69WaSAnkP9S69W.png',
    soldCount: 1200,
    discountPercentage: 20,
  },
  // Generated products
  ...Array.from({ length: 25 }).map((_, i) => ({
    name: `Product ${i + 6}`,
    description: `Mo ta cho san pham thu ${i + 6}`,
    price: Math.floor(Math.random() * 100) + 10,
    category: ['Action', 'RPG', 'Adventure', 'Strategy', 'Indie'][Math.floor(Math.random() * 5)],
    image: `https://picsum.photos/seed/${i + 6}/400/300`,
    soldCount: Math.floor(Math.random() * 2000),
    discountPercentage: Math.floor(Math.random() * 70),
  })),
];

async function main() {
  // Only seed products if table is empty
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Skipping seed: ${count} products already exist.`);
    return;
  }

  await prisma.product.createMany({ data: products });
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
