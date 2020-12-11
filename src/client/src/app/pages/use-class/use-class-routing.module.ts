import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ViewComponent } from './view/view.component';
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
  { path: 'class', redirectTo: 'class/index', pathMatch: 'full'},
  { path: 'class/index', component: IndexComponent },
  { path: 'class/:classId/view', component: ViewComponent },
  { path: 'class/create', component: CreateComponent },
  { path: 'class/:classId/edit', component: EditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UseClassRoutingModule { }
