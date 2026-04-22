import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Connect to Railway Postgres using same pattern as original seed.ts
const rawUrl = process.env.DATABASE_URL || '';
const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, '');
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type CsvRow = Record<string, string>;

interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  soldCount: number;
  discountPercentage: number;
}

// Parse a price field that can be "null", "57.79", '"57.79"', etc.
function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/["$,]/g, '').trim();
  if (!cleaned || cleaned.toLowerCase() === 'null') return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// "bought_past_month" values like "1K+", "500+", "2.5K+"
function parseSoldCount(raw: string | undefined, fallbackReviews: string | undefined): number {
  const tryParse = (s: string | undefined): number | null => {
    if (!s) return null;
    const trimmed = s.replace(/["]/g, '').trim();
    if (!trimmed || trimmed.toLowerCase() === 'null') return null;
    const m = trimmed.match(/^([\d.]+)\s*([KM]?)\+?$/i);
    if (!m) {
      const n = parseInt(trimmed.replace(/\D/g, ''), 10);
      return Number.isFinite(n) ? n : null;
    }
    const num = parseFloat(m[1]);
    const mult = m[2]?.toUpperCase() === 'K' ? 1000 : m[2]?.toUpperCase() === 'M' ? 1000000 : 1;
    return Math.floor(num * mult);
  };
  return tryParse(raw) ?? tryParse(fallbackReviews) ?? 0;
}

// "discount" values like "8%", "20%", or empty
function parseDiscount(raw: string | undefined): number {
  if (!raw) return 0;
  const m = raw.match(/(\d+)/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  return Math.max(0, Math.min(100, n));
}

// "categories" is a JSON-like array string, pick a meaningful leaf (3rd or last)
function pickCategory(raw: string | undefined): string {
  if (!raw) return 'General';
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) {
      // Prefer a deeper node (more specific), but not the leaf if it is too specific.
      // Amazon categories: ["Clothing, Shoes & Jewelry","Men","Shoes","Athletic","Running","Road Running"]
      // Use index 2 if available (e.g. "Shoes"), else last.
      const pick = arr[2] ?? arr[arr.length - 1];
      return String(pick).trim() || 'General';
    }
  } catch {
    // fallthrough
  }
  return 'General';
}

function mapRow(row: CsvRow): ProductInput | null {
  const name = (row.title || '').trim();
  const image = (row.image_url || '').trim();
  const price = parsePrice(row.final_price) ?? parsePrice(row.initial_price);

  if (!name || !image || price == null) return null;

  const description = (row.description || '').trim().slice(0, 2000) || name;
  const category = pickCategory(row.categories);
  const soldCount = parseSoldCount(row.bought_past_month, row.reviews_count);
  const discountPercentage = parseDiscount(row.discount);

  return {
    name: name.slice(0, 500),
    description,
    price,
    category,
    image,
    soldCount,
    discountPercentage,
  };
}

async function main() {
  const csvPath = path.join(__dirname, 'amazon-products.csv');
  const content = fs.readFileSync(csvPath, 'utf8');

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: false,
  }) as CsvRow[];

  const products: ProductInput[] = [];
  const seenNames = new Set<string>();
  for (const row of rows) {
    const p = mapRow(row);
    if (!p) continue;
    if (seenNames.has(p.name)) continue;
    seenNames.add(p.name);
    products.push(p);
  }

  console.log(`Parsed ${products.length} valid products from ${rows.length} rows.`);

  // Wipe dependent rows first, then products. Order matters for FK constraints.
  console.log('Cleaning existing product-related data...');
  await prisma.$transaction([
    prisma.wishlist.deleteMany({}),
    prisma.review.deleteMany({}),
    prisma.orderItem.deleteMany({}),
    prisma.order.deleteMany({}),
    prisma.product.deleteMany({}),
  ]);

  // Reset the Product id sequence so new ids start at 1.
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1`);

  // Insert in batches to avoid oversized statements.
  const batchSize = 200;
  let inserted = 0;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const res = await prisma.product.createMany({ data: batch, skipDuplicates: true });
    inserted += res.count;
    console.log(`Inserted ${inserted}/${products.length}`);
  }

  console.log(`Done. Total products in DB: ${await prisma.product.count()}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
