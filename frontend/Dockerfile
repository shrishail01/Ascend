# Stage 1: Build static assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve assets via Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom nginx configuration handling SPA React Router fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
