# syntax=docker/dockerfile:1

FROM oven/bun:1.4.2 AS dependencies
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/package.json
RUN bun install --frozen-lockfile

FROM node:24.21.0-bookworm-slim AS build
WORKDIR /app

COPY --from=dependencies /app /app
COPY apps/server apps/server
RUN rm -rf apps/server/dist apps/server/*.tsbuildinfo \
    && npm run --prefix apps/server build

FROM oven/bun:1.4.2 AS production-dependencies
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/package.json
RUN bun install --frozen-lockfile --production

FROM node:24.21.0-bookworm-slim AS runtime
WORKDIR /app/apps/server

ENV NODE_ENV=production

COPY --from=production-dependencies /app/node_modules /app/node_modules
COPY --from=production-dependencies /app/apps/server/node_modules ./node_modules
COPY --from=build /app/apps/server/dist ./dist

USER node
EXPOSE 3333
CMD ["node", "dist/infra/main.js"]
