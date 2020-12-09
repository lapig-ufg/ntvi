
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
import { NbOAuth2LoginComponent } from './oauth/oauth.component';

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
      {
        path: 'oauth',
        component: NbOAuth2LoginComponent,
      },
    ],
  },
];

const socialLinks = [
  {
    url: 'http://localhost:4200/auth/oauth',
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
          clientId: '750256806057-52odg19a6lkgbjuu67f3a12o0vq5aipq.apps.googleusercontent.com',
          clientSecret: '-59HNErVLJfZkM_RAH4s4l8N',
          authorize: {
            endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            responseType: NbOAuth2ResponseType.TOKEN,
            scope: 'https://www.googleapis.com/auth/userinfo.profile',
            redirectUri: 'https://ntvi.lapig.iesa.ufg.br/api/auth/oauth',
          },
          redirect: {
            success: '/pages/',
            failure: null,
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
