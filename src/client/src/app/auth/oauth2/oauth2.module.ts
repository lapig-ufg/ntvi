import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import {
  NbCardModule,
  NbLayoutModule,
} from '@nebular/theme';

import {
  NbAuthModule,
  NbOAuth2AuthStrategy,
  NbOAuth2ResponseType,
} from '@nebular/auth';

import { OAuth2LoginComponent } from './oauth2-login.component';
import { OAuth2CallbackComponent } from './oauth2-callback.component';
import { Oauth2RoutingModule } from './oauth2-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NbCardModule,
    NbLayoutModule,
    Oauth2RoutingModule,
  ],
  declarations: [
    OAuth2LoginComponent,
    OAuth2CallbackComponent,
  ],
})
export class OAuth2Module {
}
