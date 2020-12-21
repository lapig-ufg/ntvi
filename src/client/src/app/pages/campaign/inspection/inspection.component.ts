import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { PointService } from '../service/point.service';
import { Campaign } from '../models/campaign';
import {ActivatedRoute, Router} from '@angular/router';
import {
  NbComponentSize,
  NbComponentStatus,
  NbMediaBreakpointsService,
  NbSearchService, NbSidebarService,
  NbThemeService,
  NbToastrService,
} from '@nebular/theme';
import { User } from '../models/user';
import {Subject} from 'rxjs';
import {Camera, SecurityCamerasData } from '../../../@core/data/security-cameras';
import {map, takeUntil} from 'rxjs/operators';
import {LayoutService} from '../../../@core/utils';

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
  images = [] as any[];
  center = [] as number[];
  extent = [] as any[];
  cameras: Camera[];
  selectedCamera: Camera;
  isSingleView = false;
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
    this.securityCamerasService.getCamerasData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((cameras: Camera[]) => {
        this.cameras = cameras;
        this.selectedCamera = this.cameras[0];
      });

    const breakpoints = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(map(([, breakpoint]) => breakpoint.width))
      .subscribe((width: number) => {
        this.actionSize = width > breakpoints.md ? 'medium' : 'small';
      });
  }
  canInspect() {
    this.id = this.route.snapshot.params['campaignId'];
    this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
      this.campaign = data;
      if (this.campaign.status !== 'READY') {
        this.router.navigateByUrl('pages/campaign/index');
        this.showToast('danger', 'Campaign not ready to inspect!', 'top-right');
      } else {
        this.getPoint();
      }
    });
  }
  swicthPeriod(period) {
    this.period = period;
    this.generateImages();
  }
  getPoint() {
    const self = this;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const user = this.normalizeUser(currentUser);
    const access = { campaign: this.campaign.id, name: user, senha: 'teste123' };
    this.pointService.login(access).subscribe((data: any) => {
      self.login = data;
      this.pointService.getPoint().subscribe((_data: any) => {
        self.info = _data;
        self.points.push([ _data.point.lon, _data.point.lat]);
        self.center.push(_data.point.lon);
        self.center.push(_data.point.lat);
        self.extent.push(_data.point.bounds[0][1]);
        self.extent.push(_data.point.bounds[0][0]);
        self.extent.push(_data.point.bounds[1][1]);
        self.extent.push(_data.point.bounds[1][0]);
        self.isDataAvailable = true;
        self.generateImages();
      });
    });
  }

 generateImages() {
   this.images = [];
    for (let year = this.login.campaign.initialYear; year <= this.login.campaign.finalYear; year++) {
      let sattelite = 'L7';
      if ( year > 2012) {
        sattelite = 'L8';
      } else if (year > 2011) {
        sattelite = 'L7';
      } else if (year > 2003 || year < 2000) {
        sattelite = 'L5';
      }

      const tmsId = sattelite + '_' + year + '_' + this.period;
      const tmsIdDry = sattelite + '_' + year + '_DRY';
      const tmsIdWet = sattelite + '_' + year + '_WET';

      this.tmsIdListDry.push(tmsIdDry);
      this.tmsIdListWet.push(tmsIdWet);
      const url = `https://tvi.lapig.iesa.ufg.br/image/${tmsId}/${this.info.point._id}?campaign=${this.login.campaign._id}`;
      this.images.push({
        date: (this.info.point.dates[tmsId]) ? this.info.point.dates[tmsId] : null,
        year: year,
        url: url,
      });
    }
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

  selectCamera(camera: any) {
    this.selectedCamera = camera;
    this.isSingleView = true;
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    this.toastService.show(status, massage, { status, position, duration });
  }
}
