export const environment = {
  version: 'v0',
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
  nats: {
    url: process.env.NATS_URL || 'nats://localhost:4222',
  },
};
