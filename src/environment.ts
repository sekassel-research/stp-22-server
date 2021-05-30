export const environment = {
  auth: {
    publicKey: process.env.AUTH_PUBLIC_KEY || '-----BEGIN PUBLIC KEY-----\n' +
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkXhkzUWcDqzymbH2bMvqIVwfy4' +
      'uFHrmgLYCnirH7I31zA1Mpfdg0LKTYmHSwz8vuXiX3slDnS/jfLxvaGrBIaej3WmhJ30hV' +
      'UQVzHomzXMCpLzQcy8WGKyoljWs/pnnwcmo6jNifeZDkj0WS+OcNlvRBG0uBwY+BZTCMwi' +
      'ds+VbMEt2m59MgpVkDZM1fG9fifu02AVovDTdBSgv/T9JYS9ByDwRuE6zfqDML8KzRsgHc' +
      'm8/ytIzZOokuFQNJLXLNxxgqQ0wLXPT/hqhilDS6sT6E/6kMDCEyqO2DCzkLQLcpcF5n5F' +
      'whhhxRjp2vlc10rSL77fYKDVhO8CJIjtb0yQIDAQAB' +
      '\n-----END PUBLIC KEY-----',
    resource: process.env.AUTH_RESOURCE || 'server',
    algorithms: (process.env.AUTH_ALGORITHMS || 'RS256').split(','),
    issuer: process.env.AUTH_ISSUER || 'https://se.uniks.de/auth/realms/STP',
  },
  rateLimit: {
    ttl: 60,
    limit: 10,
  },
};
