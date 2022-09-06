import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormsModule, FormsModule as ngFormsModule} from '@angular/forms';
import {CampaignRoutingModule, routedComponents} from './campaign-routing.module';
import {Ng2SmartTableModule} from 'ng2-smart-table';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {MapModule} from '../map/map.module';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {NbMomentDateModule} from '@nebular/moment';

import {TranslateModule} from '@ngx-translate/core';
import {
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbAlertModule,
    NbCheckboxModule,
    NbDatepickerModule,
    NbIconModule,
    NbInputModule,
    NbRadioModule,
    NbSelectModule,
    NbUserModule,
    NbListModule,
    NbStepperModule,
    NbBadgeModule,
    NbSpinnerModule,
    NbToggleModule,
    NbSearchModule,
    NbTabsetModule,
    NbTooltipModule,
    NbContextMenuModule, NbAutocompleteModule,
} from '@nebular/theme';
import {ChartModule} from 'angular2-chartjs';
import {DashboardModule} from '../dashboard/dashboard.module';
import {ThemeModule} from '../../@theme/theme.module';
import {MapsModule} from '../maps/maps.module';
import {ModulesModule} from '../modules.module';

@NgModule({
    declarations: [
        ...routedComponents,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        ChartModule,
        CommonModule,
        CampaignRoutingModule,
        ReactiveFormsModule,
        Ng2SmartTableModule,
        FormsModule,
        NbAlertModule,
        NbInputModule,
        NbCardModule,
        NbButtonModule,
        NbActionsModule,
        NbUserModule,
        NbCheckboxModule,
        NbRadioModule,
        NbDatepickerModule,
        NbSelectModule,
        NbIconModule,
        ngFormsModule,
        NbListModule,
        NbStepperModule,
        NbDatepickerModule,
        NbEvaIconsModule,
        MapModule,
        NbBadgeModule,
        NbSpinnerModule,
        NbToggleModule,
        NbSearchModule,
        Ng2SearchPipeModule,
        NbMomentDateModule,
        NbTabsetModule,
        NbContextMenuModule,
        TranslateModule,
        NbAutocompleteModule,
        DashboardModule,
        NbTooltipModule,
        ThemeModule,
        MapsModule,
        ModulesModule,
    ],
})
export class CampaignModule {
}
