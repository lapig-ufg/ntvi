import { NgModule } from '@angular/core';
import { NbCardModule, NbIconModule, NbInputModule, NbTreeGridModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { ThemeModule } from '../../@theme/theme.module';
import { CampaignRoutingModule, routedComponents } from './campaign-routing.module';

@NgModule({
  imports: [
    NbCardModule,
    NbTreeGridModule,
    NbIconModule,
    NbInputModule,
    ThemeModule,
    CampaignRoutingModule,
    Ng2SmartTableModule,
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class CampaignModule { }
