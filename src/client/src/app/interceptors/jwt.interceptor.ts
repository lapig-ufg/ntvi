import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';

@Injectable()
export class JWTInterceptor implements HttpInterceptor {
  constructor(private authService: NbAuthService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.authService.getToken()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          request = request.clone({
            setHeaders: {
              token: `${token.getValue()}`,
            },
          });
        }
      });
    return next.handle(request);
  }
}
