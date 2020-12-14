import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class RoleGuardService implements  CanActivate {

  private allowedRoles: string[];

  constructor(
    private router: Router,
  ) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    this.allowedRoles = route.data['roles'];
    const currentUser = JSON.parse(localStorage.getItem('user'));
    return this.allowedRoles.includes(currentUser.role);
  }
}
