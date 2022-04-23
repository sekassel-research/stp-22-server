import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter<ThrottlerException> {
  private logger = new Logger('Throttler');

  catch(exception: ThrottlerException, host: ArgumentsHost): any {
    const req: Request = host.switchToHttp().getRequest()
    const res: Response = host.switchToHttp().getResponse<Response>();
    const {method, url, ip, ips} = req;

    this.logger.warn(`${method} ${url} - ${req.socket.remoteAddress} ${ip} [${ips.join()}] ${req.header('x-forwarded-for')} was throttled`);

    const body = {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'Too Many Requests',
    };
    res.status(HttpStatus.TOO_MANY_REQUESTS).json(body);
  }
}
