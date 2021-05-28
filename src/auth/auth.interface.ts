import { Request } from 'express';

export interface UserToken {
  id: string;
  name: string;
  clientId: string;
  roles: string[];
  resourceRoles: string[];
}

export interface ExtendedRequest extends Request {
  user: UserToken;
}
