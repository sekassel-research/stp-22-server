export interface UserToken {
  sub: string; // user id
  preferred_username: string;
}

export class RefreshToken {
  sub: string; // user id
  refreshKey: string;
}
