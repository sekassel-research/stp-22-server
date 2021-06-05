import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ThrottlerErrorDto {
  @ApiProperty({ example: HttpStatus.TOO_MANY_REQUESTS })
  statusCode: HttpStatus.TOO_MANY_REQUESTS;

  @ApiProperty({ example: 'Too Many Requests' })
  error: 'Too Many Requests';
}
