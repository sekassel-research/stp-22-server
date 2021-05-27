import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { environment } from '../environment';
import { ExtendedRequest } from './auth.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware<ExtendedRequest, Response> {
  private readonly authSchema = 'Bearer';

  constructor(
    private jwtService: JwtService,
  ) {
  }

  use(req: ExtendedRequest, res: Response, next: () => void): any {
    const { resource, algorithms, issuer } = environment.auth;
    const authHeader = (req.headers.authorization || '').split(' ');
    if (authHeader[0] !== this.authSchema) {
      throw new UnauthorizedException(`Unsupported authentication method, use '${this.authSchema}' instead`);
    }

    const token = authHeader[1];
    try {
      const validToken = this.jwtService.verify(token, { algorithms: algorithms as any[], issuer });
      if (validToken) {
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

        req.user = {
          id: validToken.sub,
          name: validToken.preferred_username || validToken.name,
          clientId: validToken.clientId,
          roles,
          resourceRoles,
        };
      }
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Invalid token');
    }

    next();
  }
}
