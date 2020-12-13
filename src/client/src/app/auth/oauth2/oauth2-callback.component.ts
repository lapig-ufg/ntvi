import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import {
  NbAuthToken,
  NbAuthResult,
  NbAuthService,
  NbTokenService,
  NbAuthOAuth2JWTToken,
  NbAuthOAuth2Token,
  NbAuthJWTToken,
} from '@nebular/auth';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-oauth2-callback',
  templateUrl: './oauth2-callback.component.html',
})

export class OAuth2CallbackComponent implements OnDestroy {

  private destroy$ = new Subject<void>();
  constructor(
    private authService: NbAuthService,
    private router: Router,
    private http: HttpClient,
    private token: NbTokenService,
    private storage: StorageMap,
  ) {
    localStorage.clear();
    localStorage.setItem('auth_type', 'oauth');
    this.authService.authenticate('google')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        const oauth = authResult.getToken();
        this.http.get('https://www.googleapis.com/oauth2/v1/userinfo?scope=A,B', {
          headers: {
            'Authorization': 'Bearer ' + oauth.getValue(),
          },
        }).subscribe(result => {
          this.http.post('/api/auth/oauth', result).subscribe(auth => {
            localStorage.setItem('token', auth.toString());
            this.router.navigate(['/pages/']);
          }, function (err) {
            localStorage.clear();
            this.router.navigate(['/auth/login']);
          });
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
