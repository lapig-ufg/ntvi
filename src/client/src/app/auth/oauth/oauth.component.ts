import {Component, OnDestroy} from '@angular/core';
import {NbAuthResult, NbAuthService, NbLoginComponent} from '@nebular/auth';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  template: '',
})
export class NbOAuth2LoginComponent implements OnDestroy {

  private destroy$ = new Subject<void>();
  constructor(private authService: NbAuthService) {
    this.authService.authenticate('google')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
