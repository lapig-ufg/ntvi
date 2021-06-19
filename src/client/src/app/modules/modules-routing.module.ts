import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { ModulesComponent } from './modules.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { AuthGuard } from '../services/auth-guard.service';
import { RoleGuardService} from '../services/role-guard.service';
import { BrokerComponent } from './broker/broker.component';

const routes: Routes = [{
  path: '',
  component: ModulesComponent,
  children: [
    // {
    //   path: 'broker',
    //   data: { roles: ['ROOT'] },
    //   canActivate: [AuthGuard, RoleGuardService],
    //   component: BrokerComponent,
    // },
    {
      path: 'campaign',
      data: { roles: ['ROOT', 'ADMIN', 'USER', 'DEFAULT'] },
      canActivate: [AuthGuard, RoleGuardService],
      loadChildren: () => import('./campaign/campaign.module')
        .then(m => m.CampaignModule),
    },
    {
      path: 'use-class',
      canActivate: [AuthGuard, RoleGuardService],
      data: { roles: ['ROOT'] },
      loadChildren: () => import('./use-class/use-class.module')
        .then(m => m.UseClassModule),
    },
    {
      path: 'satellite',
      canActivate: [AuthGuard, RoleGuardService],
      data: { roles: ['ROOT'] },
      loadChildren: () => import('./satellite/satellite.module')
        .then(m => m.SatelliteModule),
    },
    {
      path: 'organization',
      canActivate: [AuthGuard, RoleGuardService],
      data: { roles: ['ROOT'] },
      loadChildren: () => import('./organization/organization.module')
        .then(m => m.OrganizationModule),
    },
    {
      path: 'users',
      data: { roles: ['ROOT', 'ADMIN', 'USER', 'DEFAULT'] },
      canActivate: [AuthGuard, RoleGuardService],
      loadChildren: () => import('./users/users.module')
        .then(m => m.UsersModule),
    },
    {
      path: '/',
      redirectTo: 'modules/campaign/index',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModulesRoutingModule {
}
