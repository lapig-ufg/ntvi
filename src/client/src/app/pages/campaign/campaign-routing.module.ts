import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ViewComponent } from './view/view.component';
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';
import { PublicComponent } from './public/public.component';
import { InspectionComponent } from './inspection/inspection.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NbThemeService } from '@nebular/theme';

const routes: Routes = [
  { path: '', redirectTo: 'campaign/index', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'public', component: PublicComponent },
  { path: ':campaignId/view', component: ViewComponent },
  { path: 'create', component: CreateComponent },
  { path: ':campaignId/edit', component: EditComponent },
  { path: ':campaignId/inspect', component: InspectionComponent },
  { path: ':campaignId/dashboard', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {
  constructor(private themeService: NbThemeService) {
    let theme = localStorage.getItem('theme');
    if (theme === null || theme === undefined) {
      theme = 'default';
    }
    this.themeService.changeTheme(theme);
  }
}

export const routedComponents = [
  IndexComponent,
  ViewComponent,
  CreateComponent,
  EditComponent,
  InspectionComponent,
  DashboardComponent,
  PublicComponent,
];
