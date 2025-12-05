# Prime Couture Platform

Monorepo-style layout for the Prime Couture luxury fashion ecommerce experience. Frontend lives in `client/` (React + Vite), backend lives in `server/` (NestJS + Prisma + PostgreSQL).

## Prereqs
- Node 18+
- PostgreSQL
- (optional) Bun if you want to use it for the client

## Backend (`server`)
1. Copy `.env.example` to `.env` and fill values (Postgres URL, JWT secret, Cloudinary keys, WhatsApp number, allowed frontend URL).
2. Install deps and generate Prisma client:
   ```bash
   cd server
   pnpm install
   pnpm prisma:generate
   pnpm prisma:migrate -- --name init
   pnpm seed
   pnpm start:dev
   ```
   The datasource URL now lives in `prisma.config.ts` (used by Prisma CLI), while runtime connects via the `DATABASE_URL` env passed to the Prisma adapter.
3. API roots (high level):
   - `POST /auth/login` and `GET /auth/me`
   - `GET /collections`, admin CRUD under `/collections`
   - `GET /categories`, admin CRUD under `/categories`
   - `GET /products` with filters and `GET /products/:slug`; admin CRUD + image management under `/products`
- `POST /orders` (public), admin reads/updates under `/orders`
- `POST /analytics/pageview` (public) and `GET /analytics/summary` (admin)
- `GET /files/upload-signature` (admin) for Cloudinary direct uploads
- `POST /auth/register` (admin) to create additional admin users

Prisma schema implements the requested tables (users, collections, categories, products, product_images, orders, analytics_pageviews) and seeds an admin user plus sample catalog data.

## Frontend (`client`)
1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your backend URL.
2. Install and run:
   ```bash
   cd client
   pnpm install
   pnpm dev
   ```
3. The existing Vite app already includes routing, query client, and UI primitives; wire screens to the backend endpoints above as you continue building the store and admin dashboard.

## CI / quality
Add your preferred CI (GitHub Actions) to run `npm run lint`, `npm run build`, and Prisma checks on push. Both apps are TypeScript-first and ready for formatting/linting.
