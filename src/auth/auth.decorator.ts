import { applyDecorators, createParamDecorator, ExecutionContext, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from '../user/user.schema';
import { AuthErrorDto } from './auth.dto';

export const DEFAULT_DESCRIPTION = 'Missing or invalid Bearer token.';

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard('jwt')),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: DEFAULT_DESCRIPTION,
      type: AuthErrorDto,
    }),
  );
}

export const AuthUser = createParamDecorator<unknown, unknown, User>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
