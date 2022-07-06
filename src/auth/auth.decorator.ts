import { applyDecorators, createParamDecorator, ExecutionContext, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const DEFAULT_DESCRIPTION = 'Missing or invalid Bearer token.';

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard('jwt')),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: DEFAULT_DESCRIPTION,
    }),
  );
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
