# STP Server 2022 - Pioneers

## Installation

Requires [`pnpm`](https://pnpm.js.org/) instead of [`npm`].

```bash
$ pnpm install
```

## Dependencies

MongoDB and NATS are required and provided with `docker-compose`.

```bash
$ docker compose up
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
