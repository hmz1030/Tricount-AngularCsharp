import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('authToken');

    const isAuthEndpoint =
      req.url.includes('/rpc/authenticate') ||
      req.url.includes('/rpc/refresh') ||
      req.url.includes('/rpc/login') ||
      req.url.includes('/rpc/signup');

    const authReq = (token && !isAuthEndpoint)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 401 || isAuthEndpoint) {
          return throwError(() => err);
        }

        return this.auth.refresh().pipe(
          switchMap(() => {
            const newToken = sessionStorage.getItem('authToken');
            if (!newToken) return throwError(() => err);

            return next.handle(req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            }));
          })
        );
      })
    );
  }
}
