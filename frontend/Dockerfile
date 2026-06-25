# frontend/Dockerfile
# Two-stage build:
# Stage 1: Node builds the React app with VITE_API_URL baked in
# Stage 2: Nginx serves the static files
# VITE_API_URL is passed as a build arg so the frontend knows
# the api-gateway URL at build time (React env vars are baked
# into the JS bundle, not read at runtime)

# Stage 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# VITE_API_URL gets baked into the JS bundle at build time.
# For local Docker Compose: /api (nginx proxies to gateway)
# For Cloud Run: the full api-gateway *.run.app URL (passed by GitHub Actions)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]