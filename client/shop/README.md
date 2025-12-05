# Prime Couture Frontend

Two separate React apps live under `client/`:

- `/client` (existing) — public shop experience.
- `/client/admin` — new admin dashboard (login, dashboard KPIs, products, orders, analytics).

## Running the shop (public)

```bash
cd client
npm install
npm run dev
```

Env (create `.env.local`):

```
VITE_API_BASE_URL=http://localhost:3000
```

## Running the admin dashboard

```bash
cd client/admin
npm install
npm run dev
```

Env (create `client/admin/.env.local`):

```
VITE_API_BASE_URL=http://localhost:3000
```

## Notes
- Admin uses simple JWT auth against the backend (`POST /auth/login`).
- Both apps expect the Nest backend running at `http://localhost:3000` with CORS enabled.
