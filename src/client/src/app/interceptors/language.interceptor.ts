import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  constructor(public translate: TranslateService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        lang: `${this.translate.currentLang}`,
      },
    });
    return next.handle(request);
  }
}
