# ---- Stage 1: Build client and server ----
FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

# Install all dependencies (dev + prod) for building
RUN npm ci && \
    cd server && npm ci && \
    cd ../client && npm ci

# Copy source code
COPY tsconfig.base.json ./
COPY server/ ./server/
COPY client/ ./client/

# Build Vue client (typecheck + vite build)
RUN cd client && npm run build

# Build Express server (TypeScript -> JavaScript)
RUN cd server && npm run build

# ---- Stage 2: Production dependencies ----
# Separate stage because better-sqlite3 requires native compilation tools
FROM node:20-alpine AS deps

RUN apk add --no-cache python3 make g++

WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 3: Production runtime ----
FROM node:20-alpine

WORKDIR /app

# Copy production node_modules (with compiled native addons)
COPY --from=deps /app/server/node_modules ./server/node_modules

# Copy built server
COPY --from=build /app/server/dist ./server/dist
COPY server/package.json ./server/

# Copy built Vue client
COPY --from=build /app/client/dist ./client/dist

# Create data directory for SQLite
RUN mkdir -p /app/server/data

# Non-root user for security
RUN addgroup -S plectrumite && adduser -S plectrumite -G plectrumite
RUN chown -R plectrumite:plectrumite /app
USER plectrumite

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server/dist/index.js"]
