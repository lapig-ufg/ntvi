
import { NgModule } from '@angular/core';
import { RouterModule, Route} from '@angular/router';
import { OAuth2CallbackComponent } from './oauth2-callback.component';

const routes: Route[] = [
  {
    path: 'callback',
    component: OAuth2CallbackComponent,
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ],
})
export class Oauth2RoutingModule {}
