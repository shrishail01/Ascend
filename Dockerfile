# Stage 1: Build TypeScript compiler output for backend
FROM node:18-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend/ ./backend/
RUN cd backend && npm run build

# Stage 2: Distribute lightweight runtime
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production
COPY --from=builder /app/backend/dist ./backend/dist
# Expose port mapping
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "backend/dist/index.js"]
