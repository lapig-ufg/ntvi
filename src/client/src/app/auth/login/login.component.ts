import { Component, Injector, OnDestroy} from '@angular/core';
import { NbAuthResult, NbLoginComponent } from '@nebular/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    localStorage.setItem('auth_type', 'oauth');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
