import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter<ThrottlerException> {
  catch(exception: ThrottlerException, host: ArgumentsHost): any {
    const response = host.switchToHttp().getResponse<Response>();
    const body = {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'Too Many Requests',
    };
    response.status(HttpStatus.TOO_MANY_REQUESTS).json(body);
  }
}
