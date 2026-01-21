FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @repo/order-service --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN npm ci
COPY --from=builder /app/out/full/ .
RUN npm run build -- --filter=@repo/order-service

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
USER appuser
COPY --from=installer /app/apps/order-service/dist ./dist
COPY --from=installer /app/apps/order-service/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002

CMD ["node", "dist/index.js"]
