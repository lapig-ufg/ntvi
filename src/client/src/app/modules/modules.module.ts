import {NgModule} from '@angular/core';
import {NbCardModule, NbMenuModule} from '@nebular/theme';

import {ThemeModule} from '../@theme/theme.module';
import {ModulesComponent} from './modules.component';
import {DashboardModule} from './dashboard/dashboard.module';
import {ECommerceModule} from './e-commerce/e-commerce.module';
import {ModulesRoutingModule} from './modules-routing.module';
import {MiscellaneousModule} from './miscellaneous/miscellaneous.module';
import {BrokerComponent} from './broker/broker.component';
import {TranslateModule} from '@ngx-translate/core';
import {MapLeafletComponent } from '../@theme/components/map-leaflet/map-leaflet.component';

@NgModule({
    imports: [
        ModulesRoutingModule,
        ThemeModule,
        NbMenuModule,
        DashboardModule,
        ECommerceModule,
        MiscellaneousModule,
        TranslateModule,
        NbCardModule,
    ],
    declarations: [
        ModulesComponent,
        BrokerComponent,
    ],
})
export class ModulesModule {
}
