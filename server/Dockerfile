FROM node:22-bullseye-slim AS base
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY package.json nest-cli.json tsconfig*.json ./
COPY prisma ./prisma
RUN pnpm install --no-frozen-lockfile
COPY src ./src
RUN pnpm prisma:generate
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 3000
CMD ["sh", "-c", "pnpm prisma:deploy && node dist/src/main.js"]
