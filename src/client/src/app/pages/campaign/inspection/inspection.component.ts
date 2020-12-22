import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { PointService } from '../service/point.service';
import { Campaign } from '../models/campaign';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NbComponentSize,
  NbComponentStatus,
  NbMediaBreakpointsService,
  NbSearchService, NbSidebarService,
  NbThemeService,
  NbToastrService,
} from '@nebular/theme';
import { User } from '../models/user';
import { Subject } from 'rxjs';
import { Camera, SecurityCamerasData } from '../../../@core/data/security-cameras';
import { map, takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../@core/utils';

@Component({
  selector: 'ngx-inspection',
  templateUrl: './inspection.component.html',
  styleUrls: ['./inspection.component.scss'],
})
export class InspectionComponent implements OnInit, OnDestroy {


  private destroy$ = new Subject<void>();
  id: number;
  login = {} as any;
  info = {} as any;
  points = [] as any[];
  size = 3 as number;
  onSubmission = false as boolean;
  period = 'DRY' as string;
  pointEnabled = true as boolean;
  tmsIdListWet = [];
  tmsIdListDry = [];
  imagesDry = [] as any[];
  imagesWet = [] as any[];
  center = [] as number[];
  extent = [] as any[];
  cameras: Camera[];
  image = 'DRY';
  answers = [] as any[];
  counter = 0 as number;
  optionYears = [] as any[];
  actionSize: NbComponentSize = 'medium';
  campaign = {} as Campaign;
  user = {} as User;
  isDataAvailable = false as boolean;

  constructor(
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    private securityCamerasService: SecurityCamerasData,
    public campaignService: CampaignService,
    public router: Router,
    public route: ActivatedRoute,
    public toastService: NbToastrService,
    private layoutService: LayoutService,
    private sidebarService: NbSidebarService,
    private pointService: PointService,
  ) {
  }

  ngOnInit() {
    this.canInspect();
    const breakpoints = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(map(([, breakpoint]) => breakpoint.width))
      .subscribe((width: number) => {
        this.actionSize = width > breakpoints.md ? 'medium' : 'small';
      });
  }
  async canInspect() {
    this.id = this.route.snapshot.params['campaignId'];
    this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
      this.campaign = data;
      // console.log(data)
      if (this.campaign.status !== 'READY') {
        this.router.navigateByUrl('pages/campaign/index');
        this.showToast('danger', 'Campaign not ready to inspect!', 'top-right');
      } else {
        this.getPoint();
      }
    });
  }
  async getPoint() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const user = this.normalizeUser(currentUser);
    // const access = { campaign: '44', name: user, senha: 'teste123' };
    const access = { campaign: this.campaign.id, name: user, senha: 'teste123' };
    this.login = await this.pointService.login(access).toPromise();
    this.info = await this.pointService.getPoint().toPromise();
    this.points.push([this.info.point.lon, this.info.point.lat]);
    this.center.push(this.info.point.lon);
    this.center.push(this.info.point.lat);
    this.extent.push(this.info.point.bounds[0][1]);
    this.extent.push(this.info.point.bounds[1][0]);
    this.extent.push(this.info.point.bounds[1][1]);
    this.extent.push(this.info.point.bounds[0][0]);
    this.initFormViewVariables();
    this.generateOptionYears(this.login.campaign.initialYear, this.login.campaign.finalYear);
    this.generateImages();
  }
  generateImages() {
    this.imagesDry = [];
    this.imagesWet = [];
    for (let year = this.login.campaign.initialYear; year <= this.login.campaign.finalYear; year++) {
      let sattelite = 'L7';
      if (year > 2012) {
        sattelite = 'L8';
      } else if (year > 2011) {
        sattelite = 'L7';
      } else if (year > 2003 || year < 2000) {
        sattelite = 'L5';
      }

      const tmsId = sattelite + '_' + year + '_' + 'DRY';
      const tmsIdDry = sattelite + '_' + year + '_DRY';

      this.tmsIdListDry.push(tmsIdDry);
      const url = `https://tvi.lapig.iesa.ufg.br/image/${tmsId}/${this.info.point._id}?campaign=${this.login.campaign._id}`;
      this.imagesDry.push({
        date: (this.info.point.dates[tmsId]) ? this.info.point.dates[tmsId] : null,
        year: year,
        url: url,
      });
    }
    for (let year = this.login.campaign.initialYear; year <= this.login.campaign.finalYear; year++) {
      let sattelite = 'L7';
      if (year > 2012) {
        sattelite = 'L8';
      } else if (year > 2011) {
        sattelite = 'L7';
      } else if (year > 2003 || year < 2000) {
        sattelite = 'L5';
      }

      const tmsId = sattelite + '_' + year + '_' + 'WET';
      const tmsIdWet = sattelite + '_' + year + '_WET';
      this.tmsIdListWet.push(tmsIdWet);
      const url = `https://tvi.lapig.iesa.ufg.br/image/${tmsId}/${this.info.point._id}?campaign=${this.login.campaign._id}`;
      this.imagesWet.push({
        date: (this.info.point.dates[tmsId]) ? this.info.point.dates[tmsId] : null,
        year: year,
        url: url,
      });
    }
    this.isDataAvailable = true;
  }
  normalizeUser(user) {
    let name = user.name.toLowerCase();
    name = name.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '_');
    name = user.id + '_' + name;
    return name;
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  showImage(image) {
    this.image = image;
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    this.toastService.show(status, massage, { status, position, duration });
  }
  generateOptionYears(initialYear, finalYear) {
    const options = [];
    for (let year = initialYear; year <= finalYear; year++) {
      options.push(year);
    }
    this.optionYears.push(options);
  }
  getDateImages() {
    const dates = [];
    for (let i = 0; i < this.imagesWet.length; i++) {
      dates.push(new Date( this.imagesWet[i].date));
    }
    return dates;
  }
  initFormViewVariables() {
    this.optionYears = [];
    const landUseIndex = 1;
    this.answers = [
      {
        initialYear: this.login.campaign.initialYear,
        finalYear: this.login.campaign.finalYear,
        landUse: this.login.campaign.landUse[landUseIndex],
        pixelBorder: false,
      },
    ];
  }
  formPlus() {
    const prevIndex = this.answers.length - 1;
    const initialYear = this.answers[prevIndex].finalYear + 1;

    if (this.answers[prevIndex].finalYear === this.login.finalYear) return;

    const finalYear = this.login.finalYear;

    this.generateOptionYears(initialYear, finalYear);

    this.answers.push(
      {
        initialYear: initialYear,
        finalYear: finalYear,
        landUse: this.login.campaign.landUse[1],
        pixelBorder: false,
      },
    );
  }
  formSubtraction() {
    if (this.answers.length >= 1) {
      this.answers.splice(-1, 1);
      this.optionYears.splice(-1, 1);
    }
  }
  submitForm() {
    const formPoint = {
      _id: this.info.point._id,
      inspection: {
        counter: this.login.counter,
        form: this.answers,
      },
    };
    this.onSubmission = true;
  }
  initCounter() {
    this.counter = 0;
    setInterval(() => this.counter++, 1000);
  }
}
