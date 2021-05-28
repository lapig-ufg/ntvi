import { Component, Injector, OnDestroy} from '@angular/core';
import { NbAuthJWTToken, NbAuthResult, NbLoginComponent } from '@nebular/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent extends NbLoginComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  loginGoogle(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    this.service.authenticate('google')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        // console.log(authResult);
      });
  }

  async login() {
    localStorage.clear();
    localStorage.setItem('auth_type', 'email');
    localStorage.setItem('user', null);
    super.login();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
