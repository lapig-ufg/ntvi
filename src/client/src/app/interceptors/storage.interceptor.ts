import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
@Injectable()
export class StorageInterceptor implements HttpInterceptor {
  constructor(public translate: TranslateService, private storage: StorageMap) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url } = request;
    if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) {
      this.storage.set('auth_type', 'email').subscribe(() => {});
    }
    return next.handle(request);
  }
}
