import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PhotoService } from '../photo.service';
import { switchMap, catchError } from 'rxjs/operators';
import { from, of, throwError } from 'rxjs';
import { Not } from 'typeorm';

@Injectable()
export class ValidateId implements NestInterceptor {
  constructor(private readonly service: PhotoService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): import('rxjs').Observable<any> | Promise<import('rxjs').Observable<any>> {
    const id = context.switchToHttp().getRequest().params.id;

    return from(this.service.findById(id)).pipe(
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
