import { applyDecorators, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

export function Validated() {
  return applyDecorators(
    UsePipes(ValidationPipe),
    ApiBadRequestResponse({
      description: 'Validation failed.',
    }),
  );
}
