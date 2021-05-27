export const environment = {
  auth: {
    publicKey: process.env.AUTH_PUBLIC_KEY,
    resource: process.env.AUTH_RESOURCE,
    algorithms: (process.env.AUTH_ALGORITHMS || 'RS256').split(','),
    issuer: process.env.AUTH_ISSUER,
  },
};
