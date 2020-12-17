import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { NbIconLibraries, NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(
    private analytics: AnalyticsService,
    private seoService: SeoService,
    public translate: TranslateService,
    private iconLibraries: NbIconLibraries,
    private themeService: NbThemeService,
  ) {
    translate.addLangs(['en', 'pt']);
    translate.setDefaultLang('pt');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|pt/) ? browserLang : 'en');
    this.iconLibraries.registerFontPack('font-awesome', { iconClassPrefix: 'fa' });

    let theme = localStorage.getItem('theme');
    if (theme === null || theme === undefined) {
      theme = 'default';
    }
    this.themeService.changeTheme(theme);
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }
}
