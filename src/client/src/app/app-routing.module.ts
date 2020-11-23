import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import {
  NbAuthComponent,
  NbAuthModule,
  NbLoginComponent,
  NbLogoutComponent,
  NbPasswordAuthStrategy,
  NbRegisterComponent,
  NbRequestPasswordComponent,
  NbResetPasswordComponent,
} from '@nebular/auth';


export const routes: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
  },
  {
    path: 'auth',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: NbLoginComponent,
      },
      {
        path: 'login',
        component: NbLoginComponent,
      },
      {
        path: 'register',
        component: NbRegisterComponent,
      },
      {
        path: 'logout',
        component: NbLogoutComponent,
      },
      {
        path: 'request-password',
        component: NbRequestPasswordComponent,
      },
      {
        path: 'reset-password',
        component: NbResetPasswordComponent,
      },
    ],
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages' },
];

const config: ExtraOptions = {
  useHash: false,
};

const socialLinks = [
  {
    url: 'https://github.com/akveo/nebular',
    target: '_blank',
    icon: 'github',
  },
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, config),
    NbAuthModule.forRoot({
      forms: {
        login: {
          socialLinks: socialLinks,
        },
        register: {
          socialLinks: socialLinks,
        },
      },
    }),
  ],
  exports: [
    RouterModule,
    NbAuthModule,
  ],
})

export class AppRoutingModule {
}
