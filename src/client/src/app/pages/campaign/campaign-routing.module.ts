import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaignComponent } from './campaign.component';
import { CampRegisterComponent } from './camp-register/camp-register.component';

const routes: Routes = [{
  path: 'campaign',
  component: CampaignComponent,
  children: [
    {
      path: 'camp-register',
      component: CampRegisterComponent,
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
  CampRegisterComponent,
];
