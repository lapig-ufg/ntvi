import {AfterViewInit, Component} from '@angular/core';
import {NbMenuItem, NbMenuService, NbThemeService} from '@nebular/theme';
import { MENU_ITEMS } from './pages-menu';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthService} from '@nebular/auth';
import {User} from './users/model/users';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements  AfterViewInit {
  menu: NbMenuItem[] = [];
  user: User;
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await null;
      return localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await null;
      return localStorage.getItem(key);
    },
  };
  constructor(
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    public translate: TranslateService,
    private authService: NbAuthService) {
  }
  ngAfterViewInit(): void {
    const self = this;
    this.asyncLocalStorage.getItem('user').then(function (value) {
      self.user = JSON.parse(value);
      self.menu = self.getMenu();
    });
    this.asyncLocalStorage.getItem('user').then(function (value) {
      const user = JSON.parse(value);
      if (user) {
        self.translate.use(user.language.match(/en|pt/) ? user.language : 'en');
        let theme = user.theme;
        if (theme === null || theme === undefined) {
          theme = 'default';
        }
        self.themeService.changeTheme(theme);
      }
    });

    this.menuService.onItemClick().subscribe(() => {
    });
  }
  grantMenu = function (roles) {
    const self = this;
    let menuGranted;

    const roleDefault = 'DEFAULT';
    menuGranted = !roles.includes((self.user === undefined || self.user === null) ? roleDefault : self.user.role);
    return menuGranted;
  };
  getMenu(): NbMenuItem[] {
    return [
      {
        title: 'Campaigns',
        icon: 'map',
        home: true,
        hidden: this.grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
        link: '/pages/campaign/index',
      },
      {
        title: 'Public campaigns',
        icon: 'book-open-outline',
        hidden: this.grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
        link: '/pages/campaign/public',
      },
      {
        title: 'Organizations',
        icon: 'home-outline',
        link: '/pages/organization/index',
        hidden: this.grantMenu(['ROOT']),
      },
      {
        title: 'Classes',
        icon: 'list-outline',
        link: '/pages/use-class/index',
        hidden: this.grantMenu(['ROOT']),
      },
      {
        title: 'Satellites',
        icon: 'globe-2-outline',
        link: '/pages/satellite/index',
        hidden: this.grantMenu(['ROOT']),
      },
      {
        title: 'Admin Users',
        icon: 'people-outline',
        link: '/pages/users/admin',
        hidden: this.grantMenu(['ROOT']),
      },
    ];
  }
}
