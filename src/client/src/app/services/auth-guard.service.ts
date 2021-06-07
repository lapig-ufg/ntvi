import { Injectable } from '@angular/core';
import {CanActivate, Router,} from '@angular/router';
import { NbAuthService } from '@nebular/auth';
import { tap } from 'rxjs/operators';
import jwtDecode, { JwtPayload } from 'jwt-decode';

@Injectable()
export class AuthGuard implements CanActivate {
  asyncLocalStorage = {
    setItem: function (key, value) {
      return Promise.resolve().then(function () {
        localStorage.setItem(key, value);
      });
    },
    getItem: function (key) {
      return Promise.resolve().then(function () {
        return localStorage.getItem(key);
      });
    },
  };
  constructor(
    private authService: NbAuthService,
    private router: Router,
    ) {
  }

  canActivate() {
    const self = this;
    return this.authService.isAuthenticated()
      .pipe(
        tap(async function (authenticated) {
          let token = null;
          const auth_type = localStorage.getItem('auth_type');
          if (auth_type) {
            if (auth_type === 'oauth') {
              token = localStorage.getItem('token');
            } else {
              const temp = await self.authService.getToken().toPromise();
              token = temp.getValue()
            }
            const payload = jwtDecode<JwtPayload>(token);
            const isExpired = Date.now() >= payload.exp * 1000;
            if(isExpired){
              await self.router.navigate(['auth/login']);
            }
          } else {
            await self.router.navigate(['auth/login']);
          }

        }),
      );
  }
}
