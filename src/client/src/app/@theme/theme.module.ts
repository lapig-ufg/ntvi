import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    NbActionsModule,
    NbLayoutModule,
    NbMenuModule,
    NbSearchModule,
    NbSidebarModule,
    NbUserModule,
    NbContextMenuModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbThemeModule,
    NbInputModule,
    NbToggleModule,
    NbTooltipModule,
    NbCheckboxModule,
    NbCardModule,
    NbTabsetModule, NbSpinnerModule, NbWindowModule,
} from '@nebular/theme';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {NbSecurityModule} from '@nebular/security';

import {
    FooterComponent,
    HeaderComponent,
    SearchInputComponent,
    TinyMCEComponent,
    DialogComponent,
    StatusCardComponent,
    FiltersFormComponent,
    BestImagesComponent,
    MapLeafletComponent,
} from './components';
import {
    CapitalizePipe,
    PluralPipe,
    RoundPipe,
    TimingPipe,
    SafePipe,
    NumberWithCommasPipe,
} from './pipes';
import {
    OneColumnLayoutComponent,
    ThreeColumnsLayoutComponent,
    TwoColumnsLayoutComponent,
} from './layouts';
import {DEFAULT_THEME} from './styles/theme.default';
import {COSMIC_THEME} from './styles/theme.cosmic';
import {CORPORATE_THEME} from './styles/theme.corporate';
import {DARK_THEME} from './styles/theme.dark';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

const NB_MODULES = [
    NbLayoutModule,
    NbMenuModule,
    NbUserModule,
    NbActionsModule,
    NbSearchModule,
    NbSidebarModule,
    NbContextMenuModule,
    NbSecurityModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbEvaIconsModule,
    NbToggleModule,
    NbCheckboxModule,
    NbInputModule,
    NbTooltipModule,
    TranslateModule,
];
const COMPONENTS = [
    HeaderComponent,
    FooterComponent,
    SearchInputComponent,
    TinyMCEComponent,
    OneColumnLayoutComponent,
    ThreeColumnsLayoutComponent,
    TwoColumnsLayoutComponent,
    DialogComponent,
    StatusCardComponent,
    FiltersFormComponent,
    BestImagesComponent,
    MapLeafletComponent,
];
const PIPES = [
    CapitalizePipe,
    PluralPipe,
    RoundPipe,
    TimingPipe,
    SafePipe,
    NumberWithCommasPipe,
];

@NgModule({
    imports: [CommonModule,
        ...NB_MODULES,
        NbCardModule,
        NbTabsetModule,
        NbSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    entryComponents: [DialogComponent],
    exports: [CommonModule, ...PIPES, ...COMPONENTS],
    declarations: [...COMPONENTS, ...PIPES],
})
export class ThemeModule {
    constructor(public translate: TranslateModule) {
    }

    static forRoot(): ModuleWithProviders<ThemeModule> {
        return {
            ngModule: ThemeModule,
            providers: [
                ...NbThemeModule.forRoot(
                    {
                        name: 'default',
                    },
                    [DEFAULT_THEME, COSMIC_THEME, CORPORATE_THEME, DARK_THEME],
                ).providers,
            ],
        };
    }
}
