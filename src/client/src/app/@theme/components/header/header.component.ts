import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import {
  NbMediaBreakpointsService,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
  NbDialogService,
} from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbTokenService, NbAuthService, NbAuthJWTToken } from '@nebular/auth';
import { Router } from '@angular/router';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { ProfileComponent } from '../../../pages/users/profile/profile.component';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  title: string;
  english: string;
  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
  ];

  currentTheme = 'default';

  userMenu = [ { id: 'profile', title: 'Profile' }, { title: 'Log out' } ];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userService: UserData,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              public  translate: TranslateService,
              private authService: NbAuthService,
              private token: NbTokenService,
              private http: HttpClient,
              private router: Router,
              private storage: StorageMap,
              private dialogService: NbDialogService) {
    this.english = '';
  }

  ngOnInit() {
    this.english = this.translate.currentLang;
    this.title = this.translate.instant('title');
    this.getUser();
    this.currentTheme = this.themeService.currentTheme;

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    localStorage.setItem('theme', themeName);
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  toggleEnglish() {
    if (this.english === 'en') {
      this.translate.use('en');
    } else {
      this.translate.use('pt');
    }
    this.title = this.translate.instant('title');
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  logout() {
    this.authService.logout('email');
    this.storage.clear().subscribe(() => {});
    this.token.clear();
    localStorage.clear();
    localStorage.setItem('auth_type', 'email');
    localStorage.setItem('user', null);
    this.router.navigate(['auth/login']);
  }

  profile () {
   this.dialogService.open(ProfileComponent, {
     autoFocus: true,
     closeOnEsc: true,
     hasScroll: true,
   });
  }

  handleMenu(evt) {
    const self = this;
    this.menuService.onItemClick().subscribe(result => {
      const { item } = result;
      if (item.title === 'Log out') {
        self.logout();
      } else {
        if (item.hasOwnProperty('id')) {
          self.profile();
        }
      }
    });
  }
  getUser() {
    const self = this;
    let payload = {};
    const auth_type = localStorage.getItem('auth_type');
    if ( auth_type === 'oauth' ) {
      try {
        const token = localStorage.getItem('token');
        payload = jwtDecode<JwtPayload>(token.toString());
        localStorage.setItem('user', JSON.stringify(payload));
        this.user     = payload;
      } catch (error) {
        console.error(error);
      }
    } else {
      this.authService.getToken()
        .subscribe((token: NbAuthJWTToken) => {
          if (token.isValid()) {
            try {
              payload =  jwtDecode<JwtPayload>(token.toString());
              localStorage.setItem('user', JSON.stringify(payload));
              this.user = payload;
            } catch (error) {
              console.error(error);
            }
          }
        }, function (error) {
          // redirect o login
          self.authService.logout('email');
          self.token.clear();
          self.router.navigate(['auth/login']);
        });
    }
  }
}
