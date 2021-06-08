import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import {AuthGuard} from './services/auth-guard.service';


export const routes: Routes = [
  {
    path: 'modules',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/modules.module')
      .then(m => m.ModulesModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module')
      .then(m => m.AuthModule),
  },
  {
    path: '',
    redirectTo: 'modules',
    pathMatch: 'prefix',
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'modules',
    canActivate: [AuthGuard],
  },
];

const config: ExtraOptions = {
  useHash: true,
};

@NgModule({
  imports: [
    RouterModule.forRoot(routes, config),
  ],
  exports: [
    RouterModule,
  ],
})

export class AppRoutingModule {
}
