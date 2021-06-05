import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerErrorDto } from './error.dto';

export function Throttled() {
  return applyDecorators(
    UseGuards(ThrottlerGuard),
    ApiTooManyRequestsResponse({
      description: 'Rate limit reached.',
      type: ThrottlerErrorDto,
    }),
  );
}
