import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ViewComponent } from './view/view.component';
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [{
  path: '',
  component: IndexComponent,
  children: [
    {
      path: '/:classId/view',
      component: ViewComponent,
    },
    {
      path: '/create',
      component: CreateComponent,
    },
    {
      path: '/:classId/edit',
      component: EditComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UseClassRoutingModule { }
