import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { NotFoundInterceptor } from './not-found.interceptor';

export function NotFound(description?: string) {
  return applyDecorators(
    UseInterceptors(NotFoundInterceptor),
    ApiNotFoundResponse({
      description: description ?? 'Not found.',
    }),
  );
}
