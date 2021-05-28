import {Component, ElementRef, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TimelineLite } from 'gsap'
import { interval } from 'rxjs';
import {
  NbAuthResult,
  NbAuthService,
} from '@nebular/auth';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import jwtDecode, { JwtPayload } from 'jwt-decode';

@Component({
  selector: 'ngx-oauth2-callback',
  templateUrl: './oauth2-callback.component.html',
  styleUrls: ['./oauth2-callback.component.scss'],
})

export class OAuth2CallbackComponent implements OnDestroy, AfterViewInit {
  protected gqTl:TimelineLite = new TimelineLite({paused:true, reversed:true})
  private destroy$ = new Subject<void>();
  @ViewChild('box') box: ElementRef;
  constructor(
    private authService: NbAuthService,
    private router: Router,
    private http: HttpClient,
  ) {

    localStorage.clear();
    localStorage.setItem('auth_type', 'oauth');
    localStorage.setItem('user', null);
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
            const payload = jwtDecode<JwtPayload>(auth.toString());
            localStorage.setItem('user', JSON.stringify(payload));
            this.router.navigate(['/pages/']);
          }, function (err) {
            localStorage.clear();
            this.router.navigate(['/auth/login']);
          });
        });
      });
  }

  ngAfterViewInit() {
    const self = this;
    const secondsCounter = interval(1000);
    self.gqTl.staggerFromTo(self.box.nativeElement.children, 0.5, {autoAlpha: 0}, {autoAlpha: 1}, 0.1);
    secondsCounter.subscribe( () => self.gqTl.reversed() ? self.gqTl.play() : self.gqTl.reverse());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
