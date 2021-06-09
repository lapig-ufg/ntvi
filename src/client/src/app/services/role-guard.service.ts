import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import {NbToastrService, NbComponentStatus, NbThemeService} from '@nebular/theme';
import { Injectable } from '@angular/core';
import jwtDecode, {JwtPayload} from "jwt-decode";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class RoleGuardService implements CanActivate {
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
  private allowedRoles: string[];
  constructor(
    private router: Router,
    private toastService: NbToastrService,
    private themeService: NbThemeService,
    public translate: TranslateService
  ) {
    const self = this;
    this.asyncLocalStorage.getItem('user').then(function (value) {
      const user = JSON.parse(value);
      if (user) {
        self.translate.use(user.language);
        let theme = user.theme;
        if (theme === null || theme === undefined) {
          theme = 'default';
        }
        self.themeService.changeTheme(theme);
      }
    });
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const self = this;
    let currentUser = null;
    const appLocalStorage = JSON.parse(localStorage.getItem('auth_app_token'))
    let access = appLocalStorage.ownerStrategyName === "google" ? localStorage.getItem('token') : appLocalStorage['value'];
    currentUser = jwtDecode<JwtPayload>(access.toString());
    try {
      self.allowedRoles = route.data['roles'];
      const roleDefault = 'DEFAULT';
      const userRole = currentUser.hasOwnProperty('role') ?  currentUser.role :  currentUser.typeUser;
      const allowed = this.allowedRoles.includes(
        (currentUser === undefined || currentUser === null) ? roleDefault : userRole);
      if (!allowed) {
        self.showToast('warning', this.translate.instant('permission_denied'), 'top-right');
      }
      return allowed;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  showToast(status: NbComponentStatus, massage, position) {
    setTimeout(() => this.toastService.show(status, massage, { status, position }), 900);
  }
}
