import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';
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
          // const auth_type = localStorage.getItem('auth_type');
          // if (auth_type) {
          //   if (auth_type === 'oauth') {
          //     token = localStorage.getItem('token');
          //   } else {
          //     const temp = await self.authService.getToken().toPromise();
          //     token = temp.getValue();
          //     if(!token){
          //       await self.router.navigate(['auth/login']);
          //     }
          //   }
          //   const payload = jwtDecode<JwtPayload>(token);
          //   const isExpired = Date.now() >= payload.exp * 1000;
          //   if (isExpired) {
          //     await self.router.navigate(['auth/login']);
          //   }
          // } else {
          //   await self.router.navigate(['auth/login']);
          // }

          const appLocalStorage = JSON.parse(localStorage.getItem('auth_app_token'))
          if(appLocalStorage) {
            let access = appLocalStorage.ownerStrategyName === "google" ?
              localStorage.getItem('token') : appLocalStorage['value'];
            const token = jwtDecode<JwtPayload>(access);
            const isExpired = Date.now() >= token.exp * 1000;
            if (isExpired) {
              await self.router.navigate(['auth/login']);
              return false;
            }
            return true;
          } else {
            await self.router.navigate(['auth/login']);
          }

        }),
      );
  }
}
