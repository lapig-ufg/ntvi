import { Component, Injector, OnDestroy} from '@angular/core';
import {NbAuthJWTToken, NbAuthResult, NbLoginComponent} from '@nebular/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import jwtDecode, {JwtPayload} from 'jwt-decode';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
})

export class LoginComponent extends NbLoginComponent implements OnDestroy {
  private destroy$ = new Subject<void>();


  loginGoogle() {
    this.service.authenticate('google')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        // console.log(authResult);
      });
  }

  loginEmail() {
    this.login();
    localStorage.clear();
    localStorage.setItem('auth_type', 'email');
    this.service.getToken()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          const payload = jwtDecode<JwtPayload>(token.getValue());
          localStorage.setItem('user', JSON.stringify(payload));
          this.user = payload;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
