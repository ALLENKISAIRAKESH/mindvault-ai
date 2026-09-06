# ============================================
# MindVault AI — Production Dockerfile
# Single container: Express serves API + React static build
# ============================================

# --- Stage 1: Build client ---
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --production=false
COPY client/ ./
RUN npm run build

# --- Stage 2: Build server ---
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --production=false
COPY server/ ./

# --- Stage 3: Production image ---
FROM node:20-alpine AS production
WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S mindvault && \
    adduser -S mindvault -u 1001
    
COPY --from=server-build /app/server/package*.json ./
RUN npm ci --omit=dev

COPY --from=server-build /app/server/src ./src
COPY --from=client-build /app/client/dist ./public

# Cloud Run sets PORT env var
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

USER mindvault

CMD ["node", "src/index.js"]
