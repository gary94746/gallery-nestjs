import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { PhotoService } from '../photo.service';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { from, throwError } from 'rxjs';

@Injectable()
export class ValidateId implements NestInterceptor {
  constructor(private readonly service: PhotoService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): import('rxjs').Observable<any> | Promise<import('rxjs').Observable<any>> {
    const id = context.switchToHttp().getRequest().params.id;

    return from(this.service.findById(id)).pipe(
      tap(e => {
        if (!e) {
          throw new NotFoundException('Id was not found');
        }
      }),
      catchError(e => {
        if ((e.name = 'QueryFailedError')) {
          throw new NotFoundException('Id was not found');
        }
        return throwError('Photo query error');
      }),
      switchMap(() => next.handle()),
    );
  }
}
