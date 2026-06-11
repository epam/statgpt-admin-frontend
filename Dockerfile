FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NX_DAEMON=false
ENV NX_SKIP_NX_CACHE=true
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/statgpt-admin-frontend ./dist/apps/statgpt-admin-frontend
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/statgpt-admin-frontend/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./package-lock.json

RUN npm install

USER nextjs

EXPOSE 3000

WORKDIR /app/dist/apps/statgpt-admin-frontend
CMD ["npm", "run", "start"]
