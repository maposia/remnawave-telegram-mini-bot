FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Необходимые переменные окружения для сборки
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Добавляем отладочный вывод для диагностики проблемы
RUN echo "Starting build process..." && \
  if [ -f yarn.lock ]; then \
    echo "Using yarn" && yarn run build || (echo "Yarn build failed" && yarn run build --verbose && exit 1); \
  elif [ -f package-lock.json ]; then \
    echo "Using npm" && npm run build || (echo "NPM build failed" && npm run build --verbose && exit 1); \
  elif [ -f pnpm-lock.yaml ]; then \
    echo "Using pnpm" && corepack enable pnpm && pnpm run build || (echo "PNPM build failed" && pnpm run build --debug && exit 1); \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Определяем порт по умолчанию
ARG DEFAULT_PORT=3020
ENV PORT=$DEFAULT_PORT
EXPOSE ${PORT}

# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
