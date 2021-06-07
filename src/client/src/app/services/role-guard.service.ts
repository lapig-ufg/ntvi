import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { NbToastrService, NbComponentStatus } from '@nebular/theme';
import { Injectable } from '@angular/core';
import jwtDecode, {JwtPayload} from "jwt-decode";

@Injectable()
export class RoleGuardService implements CanActivate {

  private allowedRoles: string[];
  constructor(
    private router: Router,
    private toastService: NbToastrService,
  ) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const self = this;

    try {
      self.allowedRoles = route.data['roles'];
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const roleDefault = 'DEFAULT';
      const userRole = currentUser.hasOwnProperty('role') ?  currentUser.role :  currentUser.typeUser;
      const allowed = this.allowedRoles.includes((currentUser === undefined || currentUser === null) ? roleDefault : userRole);
      if (!allowed) {
        self.showToast('warning', 'Permission denied!', 'top-right');
      }
      return allowed;
    } catch (e) {
      console.log(e)
      return false;
    }
  }
  showToast(status: NbComponentStatus, massage, position) {
    setTimeout(() => this.toastService.show(status, massage, { status, position }), 1000);
  }
}
