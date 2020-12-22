import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {NbTokenService, NbAuthService, NbAuthJWTToken} from '@nebular/auth';
import {Router} from '@angular/router';
import jwtDecode, { JwtPayload } from 'jwt-decode';

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
  english: boolean;
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

  userMenu = [ { title: 'Profile' }, { title: 'Log out' } ];

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
              private storage: StorageMap) {
    this.english = false;
  }

  ngOnInit() {
    this.english = this.translate.currentLang === 'en' ? true : false;
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
    if (this.english) {
      this.translate.reloadLang('en');
    } else {
      this.translate.reloadLang('pt');
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
    this.router.navigate(['auth/login']);
  }

  profile () {
    this.router.navigate(['pages/users/profile']);
  }

  handleMenu(evt) {
    const self = this;
    this.menuService.onItemClick().subscribe(result => {
      const { item } = result;
      if (item.title === 'Log out') {
        self.logout();
      } else {
        self.profile();
      }
    });
  }
  getUser() {
    const self = this;
    const auth_type = localStorage.getItem('auth_type');
    if ( auth_type === 'oauth' ) {
      const token = localStorage.getItem('token');
      const payload = jwtDecode<JwtPayload>(token.toString());
      localStorage.setItem('user', JSON.stringify(payload));
      this.user     = payload;
    } else {
      this.authService.getToken()
        .subscribe((token: NbAuthJWTToken) => {
          if (token.isValid()) {
            const payload = jwtDecode<JwtPayload>(token.getValue());
            localStorage.setItem('user', JSON.stringify(payload));
            this.user = payload;
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
