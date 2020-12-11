import { Component } from '@angular/core';
import {NbAuthResult, NbRegisterComponent} from '@nebular/auth';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'ngx-register',
  styleUrls: ['./register.component.scss'],
  templateUrl: './register.component.html',
})
export class RegisterComponent extends NbRegisterComponent {
  private destroy$ = new Subject<void>();

  loginGoogle() {
    this.service.authenticate('google')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        // console.log(authResult);
      });
  }
}
