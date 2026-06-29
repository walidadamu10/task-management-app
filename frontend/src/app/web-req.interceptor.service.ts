import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, empty } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/users/login')) {
          // Unauthorized, attempt to refresh token
          return this.refreshAccessToken().pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((refreshError) => {
              console.error('Error refreshing token:', refreshError);
              this.authService.logout(); // Logout on token refresh error
              return empty();
            })
          );
        }
        return throwError(error);
      })
    );
  }

  refreshAccessToken(): Observable<any> {
    return this.authService.getNewAccessToken().pipe(
      tap((res: HttpResponse<any>) => {
        if (res instanceof HttpResponse) {
          const accessToken = res.headers.get('x-access-token');
          if (accessToken) {
            this.authService.setAccessToken(accessToken); // Update access token
          }
        }
      })
    );
  }

  addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getAccessToken();
    if (token) {
      return request.clone({ setHeaders: { 'x-access-token': token } });
    }
    return request;
  }
}
