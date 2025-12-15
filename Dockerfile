# Multi-stage Dockerfile for WADF Platform
# Stage 1: Builder - Build static frontend for GitHub Pages
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build static client for GitHub Pages
ENV NODE_ENV=production
RUN npm run build:client

# Production stage for full-stack deployment (Cloud Run, Railway, etc.)
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
