import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign } from '../models/campaign';
import { Router } from '@angular/router';
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

  cameras: Camera[];
  selectedCamera: Camera;
  isSingleView = false;
  actionSize: NbComponentSize = 'medium';
  campaign = {} as Campaign;
  user = {} as User;
  constructor(
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    private securityCamerasService: SecurityCamerasData,
    public campaignService: CampaignService,
    public router: Router,
    public toastService: NbToastrService,
    private layoutService: LayoutService,
    private sidebarService: NbSidebarService,
  ) {
    this.sidebarService.compact('menu-sidebar');
  }

  ngOnInit() {
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
