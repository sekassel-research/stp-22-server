const port = +process.env.PORT || 3000;

export const environment = {
  version: 'v1',
  port,
  baseUrl: process.env.BASE_URL || `http://localhost:${port}`,
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/stpss21',
  },
  auth: {
    secret: process.env.AUTH_SECRET,
    algorithms: (process.env.AUTH_ALGORITHMS || 'RS256').split(','),
    issuer: process.env.AUTH_ISSUER || 'https://se.uniks.de/auth/realms/STP',
    expiry: '1h',
    refreshExpiry: '28 days',
  },
  rateLimit: {
    ttl: +process.env.RATE_LIMIT_TTL || 60,
    limit: +process.env.RATE_LIMIT || 60,
  },
  cleanup: {
    deleteGameAfterHours: +process.env.GAME_LIFETIME_HOURS || 2,
    deleteEmptyGroupAfterHours: +process.env.EMPTY_GROUP_LIFETIME_HOURS || 1,
  },
  nats: {
    servers: process.env.NATS_URL || 'nats://localhost:4222',
  },
};
