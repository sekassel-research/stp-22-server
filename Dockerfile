FROM node:14-slim as builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:14-slim
RUN npm install -g pnpm
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY --from=builder /app/dist ./dist
COPY docs ./docs
EXPOSE 3000
CMD pnpm run start:prod
