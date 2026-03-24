FROM node:24-alpine AS base

# Upgrade Alpine packages with known vulnerabilities
RUN apk upgrade --no-cache zlib
# Upgrade npm to get patched bundled tar
RUN npm install -g npm@latest

FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/statgpt-admin-frontend ./
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./

RUN npm install

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
