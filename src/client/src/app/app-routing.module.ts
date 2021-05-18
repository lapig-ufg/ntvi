import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import {AuthGuard} from './services/auth-guard.service';


export const routes: Routes = [
  {
    path: 'pages',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module')
      .then(m => m.AuthModule),
  },
  {
    path: '',
    redirectTo: 'pages',
    pathMatch: 'prefix',
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'pages',
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
