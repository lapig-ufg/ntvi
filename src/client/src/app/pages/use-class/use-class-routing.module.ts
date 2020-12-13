import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ViewComponent } from './view/view.component';
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
  { path: '/', redirectTo: 'post/index', pathMatch: 'full'},
  { path: 'index', component: IndexComponent },
  { path: ':useClassId/view', component: ViewComponent },
  { path: 'create', component: CreateComponent },
  { path: ':useClassId/edit', component: EditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UseClassRoutingModule { }

export const routedComponents = [
  IndexComponent,
  ViewComponent,
  CreateComponent,
  EditComponent,
];
