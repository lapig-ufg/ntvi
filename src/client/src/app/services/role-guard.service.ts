import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { NbToastrService, NbComponentStatus } from '@nebular/theme';
import { Injectable } from '@angular/core';

@Injectable()
export class RoleGuardService implements CanActivate {

  private allowedRoles: string[];

  constructor(
    private router: Router,
    private toastService: NbToastrService,
  ) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    this.allowedRoles = route.data['roles'];
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const roleDefault = 'DEFAULT';
    const allowed = this.allowedRoles.includes(
      (currentUser === undefined || currentUser === null) ? roleDefault : currentUser.role);
    if (allowed === false) {
      this.showToast('warning', 'Permission denied!', 'top-right');
    }
    return allowed;
  }

  showToast(status: NbComponentStatus, massage, position) {
    this.toastService.show(status, massage, { status, position });
  }
}
