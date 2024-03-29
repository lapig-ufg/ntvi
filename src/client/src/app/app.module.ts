import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {CoreModule} from './@core/core.module';
import {ThemeModule} from './@theme/theme.module';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {LanguageInterceptor} from './interceptors/language.interceptor';
import {StorageInterceptor} from './interceptors/storage.interceptor';
import {JWTInterceptor} from './interceptors/jwt.interceptor';
import {AuthGuard} from './services/auth-guard.service';
import {RoleGuardService} from './services/role-guard.service';
import {DatePipe} from '@angular/common';
import {
    NbCardModule,
    NbChatModule,
    NbDatepickerModule,
    NbDialogModule,
    NbMenuModule,
    NbSidebarModule,
    NbToastrModule, NbToastrService,
    NbWindowModule,
} from '@nebular/theme';
import {NbTokenLocalStorage, NbTokenStorage} from '@nebular/auth';
import {LocationStrategy, PathLocationStrategy} from '@angular/common';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        AppComponent,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LanguageInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JWTInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: StorageInterceptor,
            multi: true,
        },
        {
            provide: NbTokenStorage,
            useClass: NbTokenLocalStorage,
        },
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy,
        },
        DatePipe,
        AuthGuard,
        RoleGuardService,
        NbToastrService,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        NbSidebarModule.forRoot(),
        NbMenuModule.forRoot(),
        NbDatepickerModule.forRoot(),
        NbDialogModule.forRoot(),
        NbWindowModule.forRoot(),
        NbToastrModule.forRoot(),
        NbChatModule.forRoot({
            messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
        }),
        CoreModule.forRoot(),
        ThemeModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        NbCardModule,
    ],
    exports: [
        TranslateModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
