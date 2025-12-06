FROM node:20-bullseye-slim AS admin-build
WORKDIR /app/admin
ARG ADMIN_API_BASE_URL=http://localhost:3000/api
ARG ADMIN_CLOUDINARY_CLOUD_NAME=example
ARG ADMIN_CLOUDINARY_UPLOAD_PRESET=unsigned_upload_preset
ENV VITE_API_BASE_URL=${ADMIN_API_BASE_URL}
ENV VITE_CLOUDINARY_CLOUD_NAME=${ADMIN_CLOUDINARY_CLOUD_NAME}
ENV VITE_CLOUDINARY_UPLOAD_PRESET=${ADMIN_CLOUDINARY_UPLOAD_PRESET}
RUN corepack enable
COPY client/admin/package.json client/admin/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY client/admin .
RUN pnpm build

FROM node:20-bullseye-slim AS shop-build
WORKDIR /app/shop
ARG SHOP_API_BASE_URL=http://localhost:3000/api
ARG SHOP_BRAND_NAME=Prime Couture
ENV VITE_API_BASE_URL=${SHOP_API_BASE_URL}
ENV VITE_BRAND_NAME=${SHOP_BRAND_NAME}
COPY client/shop/package.json client/shop/package-lock.json ./
RUN npm ci
COPY client/shop .
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=shop-build /app/shop/dist /usr/share/nginx/html/shop
COPY --from=admin-build /app/admin/dist /usr/share/nginx/html/admin
