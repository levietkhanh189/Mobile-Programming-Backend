import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const isProduction = process.env.NODE_ENV === 'production';
const rawUrl = process.env.DATABASE_URL || '';
// Strip sslmode param — we configure SSL via pg.Pool options instead
const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, '');

const pool = new pg.Pool({
  connectionString,
  ssl: isProduction ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
