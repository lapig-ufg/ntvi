import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class JWTInterceptor implements HttpInterceptor {
  constructor(private authService: NbAuthService, private storage: StorageMap) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth_type = localStorage.getItem('auth_type');
    if ( auth_type === 'oauth' ) {
      const token = localStorage.getItem('token');
      request = request.clone({
        setHeaders: {
          token: `${token}`,
        },
      });
    } else {
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
    }
    return next.handle(request);
  }
}
