import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class AuthErrorDto {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: HttpStatus.UNAUTHORIZED;

  @ApiProperty({ example: 'Unauthorized' })
  error: 'Unauthorized';

  @ApiProperty({ required: false })
  message?: string;
}
