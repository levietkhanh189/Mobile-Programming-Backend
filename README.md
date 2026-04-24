# Mobile Programming Backend

TypeScript REST API + Socket.IO backend for the Bookly e-commerce mobile app. Handles auth, catalog, orders, payments (SePay), reviews, coupons, and admin operations backed by PostgreSQL via Prisma.

Repo: `https://github.com/levietkhanh189/Mobile-Programming-Backend`
Production: `https://backend-production-9c18.up.railway.app/api`

## Tech Stack

- **Runtime**: Node.js ≥ 20.19
- **Language**: TypeScript 5.9
- **Framework**: Express 5
- **ORM / DB**: Prisma 5 + PostgreSQL
- **Realtime**: Socket.IO 4 (order status push)
- **Auth**: JWT (`jsonwebtoken`) + bcryptjs
- **Security**: helmet, cors, express-rate-limit
- **Email / OTP**: nodemailer (SMTP) with console fallback in dev
- **Payments**: SePay (VietQR) via `sepay-pg-node`
- **Deploy**: Railway (nixpacks)

## Quick Start

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, SMTP_*, SEPAY_*
npx prisma migrate deploy   # or: npx prisma migrate dev
npx prisma db seed          # optional demo data
npm run dev                 # http://localhost:3000
```

Production build:

```bash
npm run build               # prisma generate + tsc
npm start                   # node dist/server.js
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | ts-node-dev hot-reload server |
| `npm run build` | `prisma generate` + TypeScript compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run type-check` | `tsc --noEmit` |

## Architecture

Layered: `routes → controllers → services → prisma`

```
src/
├── config/          # env constants
├── types/           # shared TS types
├── storage/         # legacy in-memory stores (rate-limit, etc.)
├── services/        # business logic (auth, otp, payment, email, ...)
├── middleware/      # auth, error handling
├── controllers/     # HTTP handlers
├── routes/          # route definitions
├── utils/           # helpers
├── app.ts           # Express app + Socket.IO bootstrap
└── server.ts        # entry point
prisma/
├── schema.prisma    # User, Product, Order, OrderItem, Address, Review, Wishlist, Coupon, ...
├── migrations/
└── seed.ts
```

## API Overview

Base path: `/api`

### Public
- `GET  /health`
- `GET  /products`, `/products/:id`, `/products/categories`, `/products/top-sellers`, `/products/discounts`, `/products/:id/related`, `/products/:id/reviews`
- `GET  /reviews/:productId`

### Auth
- `POST /auth/send-otp` (`purpose: register | forgot-password`)
- `POST /auth/verify-otp`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/reset-password`

### User (JWT required)
- `GET  /user/profile`, `PUT /user/profile`, `POST /user/change-password`
- `POST /user/request-update-email` → `POST /user/verify-update-email`
- `POST /user/request-update-phone` → `POST /user/verify-update-phone`
- `GET  /user/me/stats`
- Addresses: `GET|POST /user/me/addresses`, `PUT|DELETE /user/me/addresses/:id`, `PATCH /user/me/addresses/:id/default`
- Wishlist: `GET /user/me/wishlist`, `POST /user/me/wishlist`, `DELETE /user/me/wishlist/:productId`

### Orders (JWT required)
- `POST /orders/checkout`
- `GET  /orders/history`
- `GET  /orders/:id`
- `DELETE /orders/:id` (cancel)

### Reviews (JWT required)
- `POST /reviews`

### Payments — SePay
- `POST /payments/sepay/create` (JWT)
- `POST /payments/sepay/webhook` (server-to-server)
- `GET  /payments/sepay/return`
- `GET  /payments/sepay/status/:orderId` (JWT)

### Admin (JWT + ADMIN/MANAGER role)
- Auth: `POST /admin/auth/login`, `POST /admin/auth/seed`
- Products: full CRUD on `/admin/products`
- Orders: `GET /admin/orders`, `GET /admin/orders/:id`, `PUT /admin/orders/:id/status`
- Users: `GET /admin/users`, `GET /admin/users/:id`, `PUT /admin/users/:id/role`
- Coupons: full CRUD on `/admin/coupons` + `PATCH /admin/coupons/:id/toggle`
- Revenue: `GET /admin/revenue/summary`, `/admin/revenue/daily`, `/admin/revenue/top-products`

Protected routes require header: `Authorization: Bearer <JWT>`.

## Realtime (Socket.IO)

Admin changes to order status emit events to the customer's socket room, letting the mobile app update orders live without polling.

## Database

PostgreSQL managed through Prisma. Core models: `User` (roles: CUSTOMER / MANAGER / ADMIN), `Product`, `Order`, `OrderItem`, `Address`, `Review`, `Wishlist`, `Coupon`. See `prisma/schema.prisma`.

Run migrations:

```bash
npx prisma migrate dev        # local dev
npx prisma migrate deploy     # prod / CI
npx prisma studio             # GUI
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=change-me
JWT_EXPIRY=7d
OTP_EXPIRY_MINUTES=5
RATE_LIMIT_MAX_REQUESTS=3
RATE_LIMIT_WINDOW_MINUTES=15

# SMTP (nodemailer) — optional, falls back to console log
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# SePay
SEPAY_API_KEY=
SEPAY_WEBHOOK_SECRET=
SEPAY_RETURN_URL=

# Admin bootstrap
ADMIN_SEED_KEY=
```

## Deployment — Railway

`nixpacks.toml` provisions Node 24 for Prisma compatibility. Connect the GitHub repo, attach a Postgres plugin, set the env vars above, and deploy. Railway runs `npm run build` then `npm start`.

Seed the first admin once after deploy:

```bash
curl -X POST https://<backend>.up.railway.app/api/admin/auth/seed \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@shop.com","password":"Admin@123","secretKey":"<ADMIN_SEED_KEY>"}'
```

## Security Notes

- bcryptjs with salt rounds 10
- JWT 7-day expiry (configurable)
- `express-rate-limit` + per-email OTP window (3 req / 15 min)
- `helmet` default hardening; CORS currently open — restrict in production
- OTP codes logged to server stdout when SMTP is not configured

## License

ISC
