const port = +process.env.PORT || 3000;

export const environment = {
  version: process.env.API_VERSION || 'v2',
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
  passive: !!process.env.PASSIVE,
  cleanup: {
    gameLifetimeHours: +process.env.GAME_LIFETIME_HOURS || 2,
    emptyGroupLifetimeHours: +process.env.EMPTY_GROUP_LIFETIME_HOURS || 1,
    tempUserLifetimeHours: +process.env.TEMP_USER_LIFETIME_HOURS || 1,
    tempUserNamePattern: process.env.TEMP_USER_NAME_PATTERN
      ? new RegExp(process.env.TEMP_USER_NAME_PATTERN)
      : /t[e3]mp|t[e3][s5]t|^.$|^\d+$/i,
    globalMessageLifetimeHours: +process.env.GLOBAL_MESSAGE_LIFETIME_HOURS || 4,
    spamMessageLifetimeHours: +process.env.SPAM_MESSAGE_LIFETIME_HOURS || 1,
    spamMessagePattern: process.env.SPAM_MESSAGE_PATTERN
      ? new RegExp(process.env.SPAM_MESSAGE_PATTERN)
      : /^.$|(.{1,3})\1{2,}|^This message was deleted$/,
  },
  nats: {
    servers: process.env.NATS_URL || 'nats://localhost:4222',
  },
};
