import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NotFoundInterceptor<T> implements NestInterceptor<T | null | undefined, T> {
  intercept(context: ExecutionContext, next: CallHandler<T | null | undefined>): Observable<T> {
    return next.handle().pipe(map(value => {
      if (value === null || value === undefined) {
        throw new NotFoundException();
      }
      return value;
    }));
  }
}
