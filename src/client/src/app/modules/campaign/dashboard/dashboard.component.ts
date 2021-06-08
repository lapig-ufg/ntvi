import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign } from '../models/campaign';
import { Router } from '@angular/router';
import {
  NbComponentSize,
  NbComponentStatus,
  NbMediaBreakpointsService,
  NbSearchService, NbSidebarService,
  NbThemeService, NbColorHelper,
  NbToastrService,
} from '@nebular/theme';
import { User } from '../models/user';
import { Subject } from 'rxjs';
import { Camera, SecurityCamerasData } from '../../../@core/data/security-cameras';
import { map, takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../@core/utils';
import { LocalDataSource } from 'ng2-smart-table';


@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {


  private destroy$ = new Subject<void>();

  cameras: Camera[];
  selectedCamera: Camera;
  isSingleView = false;
  actionSize: NbComponentSize = 'medium';
  campaign = {} as Campaign;
  user = {} as User;

  settings: any;
  data: any;

  dataChart: any;
  options: any;
  themeSubscription: any;
  tmpModis: any;


  constructor(
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    private securityCamerasService: SecurityCamerasData,
    public campaignService: CampaignService,
    public router: Router,
    public toastService: NbToastrService,
    private layoutService: LayoutService,
    private sidebarService: NbSidebarService,
    private theme: NbThemeService,
  ) {
    this.sidebarService.compact('menu-sidebar');
  }

  ngOnInit() {

    this.teste();

    this.testeChart();


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
    this.themeSubscription.unsubscribe();
  }

  selectCamera(camera: any) {
    this.selectedCamera = camera;
    this.isSingleView = true;
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    this.toastService.show(status, massage, { status, position, duration });
  }

  onSaveConfirm(event) {
    if (window.confirm('Are you sure you want to edit this Use Class?')) {
      event.confirm.resolve(event.newData);
    } else {
      event.confirm.reject();
    }

  }

  testeChart() {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      const colors: any = config.variables;
      const chartjs: any = config.variables.chartjs;
      this.campaignService.returnNDVISeries('-46.440074', '-12.007367').subscribe(
        result => {
          this.tmpModis = result;
        },
        err => {
          // console.log('Error: ', err);
        },
        () => {

          this.dataChart = {
            labels: this.tmpModis.map(element => element.date),
            datasets: [{
              data: this.tmpModis.map(element => element.ndvi_golay.toFixed(4)),
              label: 'NDVI',
              // backgroundColor: NbColorHelper.hexToRgbA(colors.primary, 0.3),
              borderColor: colors.primary,
              fill: false,
              hidden: false,
              pointRadius: 1,
              pointHoverRadius: 3,
              pointStyle: 'rect',
            },
              // , {
              //   data: [28, 48, 40, 19, 86, 27, 90],
              //   label: 'Series B',
              //   backgroundColor: NbColorHelper.hexToRgbA(colors.danger, 0.3),
              //   borderColor: colors.danger,
              // }, {
              //   data: [18, 48, 77, 9, 100, 27, 40],
              //   label: 'Series C',
              //   backgroundColor: NbColorHelper.hexToRgbA(colors.info, 0.3),
              //   borderColor: colors.info,
              // },
            ],
          };

          this.options = {
            responsive: true,
            maintainAspectRatio: false,
            radius: 1,
            tooltips: {
              mode: 'index',
              intersect: true,
            },
            scales: {
              xAxes: [
                {
                  gridLines: {
                    display: true,
                    color: chartjs.axisLineColor,
                  },
                  ticks: {
                    fontColor: chartjs.textColor,
                    autoSkip: true,
                    stepSize: 0.2,
                  },
                  type: 'time',
                },
              ],
              yAxes: [
                {
                  gridLines: {
                    display: true,
                    color: chartjs.axisLineColor,
                  },
                  ticks: {
                    fontColor: chartjs.textColor,
                    autoSkip: true,
                    stepSize: 0.2,
                  },
                },
              ],
            },
            legend: {
              labels: {
                fontColor: chartjs.textColor,
              },
              position: 'bottom',
            },
          };
        });
    });
  }

  teste() {
    this.settings = {
      // mode: 'inline',
      hideSubHeader: true,
      edit: {
        confirmSave: true,
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      actions: {
        position: 'right',
        delete: false,
        edit: true,
      },
      columns: {
        id: {
          title: 'ID',
          filter: false,
          editable: false,
        },
        name: {
          title: 'Full Name',
          filter: false,
          editable: false,
        },
        username: {
          title: 'User Name',
          filter: false,
          editable: false,
        },
        email: {
          title: 'Email',
          editable: true,
          type: 'html',
          editor: {
            type: 'list',
            config: {
              list: [{ value: 'Antonette', title: 'Antonette' }, { value: 'Bret', title: 'Bret' }, {
                value: '<b>Samantha</b>',
                title: 'Samantha',
              }],
            },
          },
        },
      },
    };

    this.data = [
      {
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz',
      },
      {
        id: 2,
        name: 'Ervin Howell',
        username: 'Antonette',
        email: 'Shanna@melissa.tv',
      },
      {
        id: 3,
        name: 'Clementine Bauch',
        username: 'Samantha',
        email: 'Nathan@yesenia.net',
      },
      {
        id: 4,
        name: 'Patricia Lebsack',
        username: 'Karianne',
        email: 'Julianne.OConner@kory.org',
      },
      {
        id: 5,
        name: 'Chelsey Dietrich',
        username: 'Kamren',
        email: 'Lucio_Hettinger@annie.ca',
      },
      {
        id: 6,
        name: 'Mrs. Dennis Schulist',
        username: 'Leopoldo_Corkery',
        email: 'Karley_Dach@jasper.info',
      },
      {
        id: 7,
        name: 'Kurtis Weissnat',
        username: 'Elwyn.Skiles',
        email: 'Telly.Hoeger@billy.biz',
      },
      {
        id: 8,
        name: 'Nicholas Runolfsdottir V',
        username: 'Maxime_Nienow',
        email: 'Sherwood@rosamond.me',
      },
      {
        id: 9,
        name: 'Glenna Reichert',
        username: 'Delphine',
        email: 'Chaim_McDermott@dana.io',
      },
      {
        id: 10,
        name: 'Clementina DuBuque',
        username: 'Moriah.Stanton',
        email: 'Rey.Padberg@karina.biz',
      },
      {
        id: 11,
        name: 'Nicholas DuBuque',
        username: 'Nicholas.Stanton',
        email: 'Rey.Padberg@rosamond.biz',
      },
    ];

    // source: new LocalDataSource();
  }


}
