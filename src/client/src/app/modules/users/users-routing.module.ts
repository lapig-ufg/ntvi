import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AdminComponent } from './admin/admin.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
  { path: '/', redirectTo: 'campaign/index', pathMatch: 'prefix'},
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', component: AdminComponent },
  { path: ':userId/edit', component: EditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule { }

export const routedComponents = [
  ProfileComponent,
  AdminComponent,
  EditComponent,
];
