FROM node:24.21-alpine3.24 AS base

# zlib 1.3.2-r0 in the base image is affected by CVE-2026-85091; 1.3.2-r1 is patched.
RUN apk upgrade --no-cache zlib

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

# Runtime starts with node directly. Project overrides do not patch global npm's
# bundled dependencies (brace-expansion, ip-address, tar, undici), so remove
# npm/npx and its cache after the last install.
RUN npm install --omit=dev \
    && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

USER nextjs

EXPOSE 3000

WORKDIR /app/dist/apps/statgpt-admin-frontend
CMD ["node", "/app/node_modules/next/dist/bin/next", "start"]
