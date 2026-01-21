FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @repo/user-service --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN npm ci
COPY --from=builder /app/out/full/ .
RUN npm run build -- --filter=@repo/user-service

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
USER appuser
COPY --from=installer /app/apps/user-service/dist ./dist
COPY --from=installer /app/apps/user-service/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/index.js"]
