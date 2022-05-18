import { applyDecorators, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

export function Validated() {
  return applyDecorators(
    UsePipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    })),
    ApiBadRequestResponse({
      description: 'Validation failed.',
    }),
  );
}
