
import { NgModule } from '@angular/core';
import {ActivatedRoute, Router, RouterModule, Routes} from '@angular/router';
import { environment as env } from '../../environments/environment';
import {
  NbAuthComponent,
  NbAuthJWTToken,
  NbAuthModule, NbAuthOAuth2Token,
  NbOAuth2AuthStrategy, NbOAuth2GrantType,
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
      {
        path: 'oauth2',
        loadChildren: () => import('./oauth2/oauth2.module')
          .then(m => m.OAuth2Module),
      },
    ],
  },
];

const socialLinks = [
  {
    url: env.oauthGoogleUrl,
    target: '_blank',
    icon: 'google',
  },
];


// @ts-ignore
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
          clientId: env.clientId,
          clientSecret: env.clientSecret,
          authorize: {
            endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            responseType: NbOAuth2ResponseType.TOKEN,
            scope: 'email profile',
            redirectUri: env.redirectUri,
          },
          redirect: {
            success: '/pages',
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
