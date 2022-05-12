export interface UserToken {
  sub: string; // user id
  preferred_username: string;
  iat: number; // issued at, unix seconds
  exp: number; // expires at, unix seconds
}

export class RefreshToken {
  sub: string; // user id
  refreshKey: string;
}
