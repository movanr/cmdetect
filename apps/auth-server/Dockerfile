# Auth Server Production Dockerfile
# Multi-stage build for optimized image size

FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/auth-server/package.json ./apps/auth-server/
COPY packages/config/package.json ./packages/config/

# Install all dependencies
RUN pnpm install --frozen-lockfile --filter @cmdetect/auth-server...

# Stage 2: Build application
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/auth-server/node_modules ./apps/auth-server/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules

# Copy source code
COPY packages/config ./packages/config
COPY apps/auth-server ./apps/auth-server
COPY tsconfig.json ./

# Build shared config package
RUN pnpm --filter @cmdetect/config build

# Build auth server
RUN pnpm --filter @cmdetect/auth-server build

# Stage 3: Production runtime
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 authserver

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/auth-server/node_modules ./apps/auth-server/node_modules

# Copy built application
COPY --from=builder --chown=authserver:nodejs /app/apps/auth-server/dist ./apps/auth-server/dist
COPY --from=builder --chown=authserver:nodejs /app/apps/auth-server/package.json ./apps/auth-server/
COPY --from=builder --chown=authserver:nodejs /app/packages/config/dist ./packages/config/dist
COPY --from=builder --chown=authserver:nodejs /app/packages/config/package.json ./packages/config/

USER authserver

EXPOSE 3001

WORKDIR /app/apps/auth-server

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/auth/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
