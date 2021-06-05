import { applyDecorators, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';
import { ValidationErrorDto } from './error.dto';

export function Validated() {
  return applyDecorators(
    UsePipes(ValidationPipe),
    ApiBadRequestResponse({
      description: 'Validation failed.',
      type: ValidationErrorDto,
    }),
  );
}
