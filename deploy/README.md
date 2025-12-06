# Deployment (Docker Compose)

This repo is ready to run on a single VM (your 41.186.186.103 host) with Docker Compose. It brings up:
- Postgres
- NestJS API
- Nginx serving the shop on port 80 and the admin on port 8081, proxying `/api` to the API container

## 0) Prereqs on the server
1) Swap (if not already): see the earlier swap steps you ran (`fallocate/dd`, `mkswap`, `swapon`, add to `/etc/fstab`).
2) Install Docker + Compose plugin (Ubuntu example):
   ```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo systemctl enable --now docker
   ```
   Add your user to the docker group (log out/in after): `sudo usermod -aG docker $USER`

## 1) Prepare env files (never commit secrets)
From `deploy/` on your local machine, copy the samples and fill in real values:
```bash
cp env/postgres.env.example env/postgres.env
cp env/server.env.example env/server.env
cp .env.example .env
```
- `env/postgres.env`: Postgres user/password/db. Compose uses this for the `db` service.
- `env/server.env`: Backend runtime values. Set `DATABASE_URL` to point to the `db` service (leave host as `db`), and set `FRONTEND_URL` to the public URL you’ll serve (e.g., `http://41.186.186.103` or your domain).
- `deploy/.env`: Build-time values for the shop/admin Vite builds and Cloudinary upload preset. Set API URLs to the public URL you’ll hit from the browser (defaults assume you’ll use Nginx proxying `/api` on port 80/8081).

## 2) Build & run
Run from `deploy/` (on the server after you copy the repo there):
```bash
docker compose build --pull
docker compose up -d
docker compose ps
```
- Shop: `http://41.186.186.103` (port 80)
- Admin: `http://41.186.186.103:8081`
- API: proxied at `/api` via Nginx, or directly on `http://41.186.186.103:3000`

## 3) Migrations & data
The API container runs `pnpm prisma:deploy` on startup. If you need to apply fresh seeds, exec into the container:
```bash
docker compose exec server pnpm seed
```

## 4) Logs & lifecycle
```bash
docker compose logs -f server
docker compose logs -f web
docker compose down     # stop
docker compose pull && docker compose up -d --build  # upgrade
```

## Domains/TLS
- If you add domains, point DNS to the server IP and update `FRONTEND_URL`, `SHOP_API_BASE_URL`, `ADMIN_API_BASE_URL`.
- Add Let’s Encrypt via an additional reverse-proxy (e.g., run Caddy or nginx-proxy/acme-companion) if you want HTTPS. This config keeps HTTP for simplicity.

## Footprint
- Postgres data stored in the named volume `db-data`.
- Backend and frontends are rebuilt via Compose, so CI/CD can just sync the repo and run `docker compose up -d --build`.
