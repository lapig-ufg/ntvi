import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaignComponent } from './campaign.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [{
  path: '',
  component: CampaignComponent,
  children: [
    {
      path: 'register',
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
