
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  NbAuthComponent,
  NbAuthJWTToken,
  NbAuthModule,
  NbOAuth2AuthStrategy,
  NbOAuth2ResponseType,
  NbPasswordAuthStrategy,
} from '@nebular/auth';

import { LoginComponent } from './login/login.component';
import { RegisterComponent} from './register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: NbAuthComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
    ],
  },
];

const socialLinks = [
  {
    url: 'https://github.com/akveo/nebular',
    target: '_blank',
    icon: 'google',
  },
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    NbAuthModule.forRoot({
      strategies: [
        NbPasswordAuthStrategy.setup({
          name: 'email',
          token: {
            class: NbAuthJWTToken,
            key: 'token',
          },
          login: {
            endpoint: 'login',
            redirect: {
              success: '/pages/campaign/',
              failure: '/auth/login',
            },
          },
          register: {
            endpoint: 'register',
            redirect: {
              success: '/pages/campaign/',
              failure: '/auth/register',
            },
          },
          logout: {
            endpoint: 'logout',
            method: null,
            redirect:
              {
                success: '/',
                failure: '/',
              },
            },
        }),
        NbOAuth2AuthStrategy.setup({
          name: 'google',
          clientId: 'YOUR_CLIENT_ID',
          clientSecret: '',
          authorize: {
            endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            responseType: NbOAuth2ResponseType.TOKEN,
            scope: 'https://www.googleapis.com/auth/userinfo.profile',
          },
          redirect: {
            success: '/welcome/', // welcome page path
            failure: null, // stay on the same page
          },
        }),
      ],
      forms: {
        login: {
          socialLinks: socialLinks,
          redirectDelay: 500,
          strategy: 'email',
          rememberMe: true,
          showMessages: {
            success: true,
            error: true,
          },
        },
        register: {
          socialLinks: socialLinks,
          rememberMe: true,
        },
      },
    }),
  ],
  exports: [
    RouterModule,
    NbAuthModule,
  ],
})
export class AuthRoutingModule {
}
