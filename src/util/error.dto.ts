import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: HttpStatus.BAD_REQUEST;

  @ApiProperty({ example: 'Bad Request' })
  error: 'Bad Request';

  @ApiProperty({ type: [String] })
  message: string[];
}

export class ThrottlerErrorDto {
  @ApiProperty({ example: HttpStatus.TOO_MANY_REQUESTS })
  statusCode: HttpStatus.TOO_MANY_REQUESTS;

  @ApiProperty({ example: 'Too Many Requests' })
  error: 'Too Many Requests';
}
