FROM node:14-slim as builder
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm run build

FROM node:14-slim
RUN npm install -g pnpm
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
COPY docs ./docs
RUN pnpm install
EXPOSE 3000
CMD pnpm run start:prod
