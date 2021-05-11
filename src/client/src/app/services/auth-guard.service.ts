import { Injectable } from '@angular/core';
import {CanActivate, Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { NbAuthService } from '@nebular/auth';
import { tap } from 'rxjs/operators';
import jwtDecode, { JwtPayload } from 'jwt-decode';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: NbAuthService,
    private router: Router,
    ) {
  }

  canActivate() {
    return this.authService.isAuthenticated()
      .pipe(
        tap(authenticated => {
          let canAccess = true;
          const token = localStorage.getItem('token');
          if (token) {
            const payload = jwtDecode<JwtPayload>(token);
            canAccess = Date.now() >= payload.exp * 1000;
          } else {
            canAccess = false;
          }
          if (!authenticated || canAccess) {
            this.router.navigate(['auth/login']);
          }
        }),
      );
  }
}
