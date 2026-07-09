# Stage 1: Build TypeScript compiler output
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Distribute lightweight runtime
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
# Expose port mapping
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
