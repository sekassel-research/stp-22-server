import { HttpStatus } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponse {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: HttpStatus.BAD_REQUEST;

  @ApiProperty({ example: 'Bad Request' })
  error: 'Bad Request';

  @ApiProperty({ type: [String] })
  message: string[];
}

function toText(key: string) {
  return key.split('_').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
}

export class ErrorResponse {
  @ApiProperty({
    enum: Object.values(HttpStatus).filter(value => value in HttpErrorByCode),
  })
  statusCode: number;

  @ApiProperty({
    enum: Object.entries(HttpStatus)
      .filter(([, value]) => value in HttpErrorByCode)
      .map(([key]) => toText(key)),
  })
  error: string;

  @ApiProperty({ required: false })
  message?: string;
}
