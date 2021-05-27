import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExtendedRequest } from './auth.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }

  canActivate(ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const expectedRoles = this.reflector.get<string[]>('roles', handler);
    if (!expectedRoles) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest() as ExtendedRequest;
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Missing user');
    }

    for (const role of expectedRoles) {
      if (user.roles.includes(role) || user.resourceRoles.includes(role)) {
        return true;
      }
    }

    throw new UnauthorizedException('Missing roles');
  }
}
