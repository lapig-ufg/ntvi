import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaignComponent } from './campaign.component';
import { RegisterComponent } from './register/register.component';
import {AuthGuard} from '../../services/auth-guard.service';

const routes: Routes = [{
  path: '',
  component: CampaignComponent,
  children: [
    {
      path: 'register',
      data: { roles: ['ROOT', 'ADMIN', 'USER'] },
      canActivate: [AuthGuard],
      component: RegisterComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule { }

export const routedComponents = [
  CampaignComponent,
  RegisterComponent,
];
