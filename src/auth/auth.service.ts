import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { environment } from '../environment';
import { UserToken } from './auth.interface';

const AUTH_SCHEMA = 'Bearer';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {
  }

  getTokenFromAuthHeader(authHeader: string): string | undefined {
    const words = authHeader.split(' ');
    if (words[0] !== AUTH_SCHEMA) {
      throw new UnauthorizedException(`Unsupported authentication method, use '${AUTH_SCHEMA}' instead`);
    }
    return words[1];
  }

  parseToken(token: string): UserToken {
    const { resource, algorithms, issuer } = environment.auth;
    try {
      const validToken = this.jwtService.verify(token, { algorithms: algorithms as any[], issuer });
      if (!validToken) {
        throw new UnauthorizedException('invalid token');
      }
      let roles: string[];
      let resourceRoles: string[];
      try {
        roles = validToken.realm_access.roles;
      } catch (err) {
        roles = validToken.scope || [];
      }
      try {
        resourceRoles = validToken.resource_access[resource].roles;
      } catch (err) {
        resourceRoles = [];
      }

      return {
        id: validToken.sub,
        name: validToken.preferred_username || validToken.name,
        clientId: validToken.clientId,
        roles,
        resourceRoles,
      };
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Invalid token');
    }
  }
}
