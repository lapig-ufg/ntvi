import { AfterViewInit, Component } from '@angular/core';
import { NbMenuItem, NbMenuService, NbThemeService } from '@nebular/theme';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-modules',
  styleUrls: ['modules.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class ModulesComponent implements  AfterViewInit {
  menu: NbMenuItem[] = [];
  user: {};
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
    public translate: TranslateService) {
  }
  ngAfterViewInit(): void {
    const self = this;
    this.asyncLocalStorage.getItem('user').then(function (value) {
      const user = JSON.parse(value);
      if (user) {

        self.translate.use(user.language.match(/en|pt/) ? user.language : 'en');

        let theme = user.theme;
        if (theme === null || theme === undefined) {
          theme = 'default';
        }
        self.themeService.changeTheme(theme);
        self.user = user;
        self.menu = self.getMenu();
      }
    });
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      self.menu = self.getMenu();
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
        title: this.translate.instant('menu_campaigns'),
        icon: 'map',
        home: true,
        hidden: this.grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
        link: '/modules/campaign/index',
      },
      {
        title: this.translate.instant('menu_public_campaigns'),
        icon: 'book-open-outline',
        hidden: this.grantMenu(['ROOT', 'ADMIN', 'USER', 'DEFAULT']),
        link: '/modules/campaign/public',
      },
      {
        title: this.translate.instant('menu_organizations'),
        icon: 'home-outline',
        link: '/modules/organization/index',
        hidden: this.grantMenu(['ROOT']),
      },
      {
        title: this.translate.instant('menu_classes'),
        icon: 'list-outline',
        link: '/modules/use-class/index',
        hidden: this.grantMenu(['ROOT']),
      },
      {
        title: this.translate.instant('menu_satellites'),
        icon: 'globe-2-outline',
        link: '/modules/satellite/index',
        hidden: this.grantMenu(['ROOT']),
      },
      {
        title: this.translate.instant('menu_users'),
        icon: 'people-outline',
        link: '/modules/users/admin',
        hidden: this.grantMenu(['ROOT']),
      },
    ];
  }
}
