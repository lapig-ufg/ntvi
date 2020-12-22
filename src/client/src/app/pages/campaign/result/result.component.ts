import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign } from '../models/campaign';
import { Router, ActivatedRoute } from '@angular/router';
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
import { PointService } from '../service/point.service';


@Component({
  selector: 'ngx-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit, OnDestroy {


  private destroy$ = new Subject<void>();

  id: number;
  login = {} as any;
  info = {} as any;
  infoP = {} as any;
  points = [] as any[];
  landUses = [] as any[];
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
  isModisAvailable = false as boolean;
  isDataTableAvailable = false as boolean;

  settings: any;
  data: any;

  usersInspectionsTable = { data: {}, settings: {}, source: new LocalDataSource() };

  modisChart = { data: {}, options: {}, type: 'line' };
  themeSubscription: any;
  tmpModis: any;


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
    private theme: NbThemeService,
    private pointService: PointService,
  ) {
    this.sidebarService.compact('menu-sidebar');
  }

  ngOnInit() {

    this.isInspected();
    const breakpoints = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(map(([, breakpoint]) => breakpoint.width))
      .subscribe((width: number) => {
        this.actionSize = width > breakpoints.md ? 'medium' : 'small';
      });

  }

  async getPoint() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const user = this.normalizeUser(currentUser);
    // const access = { campaign: '44', name: user, senha: 'teste123' };
    const access = { campaign: 'fip_validacao_2019_comp', name: 'admin', senha: 'TV1lapig' };
    this.login = await this.pointService.login(access).toPromise();
    this.infoP = await this.pointService.getPoint().toPromise();
    this.landUses = await this.pointService.getLandUses().toPromise();
    this.info = await this.pointService.getPointResult({ index: this.infoP.point.index }).toPromise();
    this.points.push([this.info.point.lon, this.info.point.lat]);
    this.center.push(this.info.point.lon);
    this.center.push(this.info.point.lat);
    this.extent.push(this.info.point.bounds[0][1]);
    this.extent.push(this.info.point.bounds[1][0]);
    this.extent.push(this.info.point.bounds[1][1]);
    this.extent.push(this.info.point.bounds[0][0]);
    this.initFormViewVariables();
    this.generateOptionYears(this.login.campaign.initialYear, this.login.campaign.finalYear);
    this.getUsersInspections();
    this.generateImages();
    this.initModisChart();


  }

  getUsersInspections() {

    const inspectobj = this.info.point.inspection;
    let myObj = new Object;

    let arr = [];

    for (const land of this.landUses) {
      arr.push({
        value: land, title: land
      });
    }

    // list: [{ value: 'Antonette', title: 'Antonette' }, { value: 'Bret', title: 'Bret' }, {
    //   value: '<b>Samantha</b>',
    //   title: 'Samantha',
    // }],

    myObj['year'] = {
      title: 'Year',
      filter: false,
      editable: false,
    };

    myObj['classConsolidated'] = {
      title: 'Consolidated Class',
      editable: true,
      type: 'html',
      editor: {
        type: 'list',
        config: {
          list: arr,
        },
      },
    };

    let arrData = [];

    for (const o of inspectobj) {
      myObj[o.userName] = {
        title: o.userName.toString(),
        filter: false,
        editable: false,
      };

    }

    for (let i = 0; i < this.info.point.years.length; i++) {

      let finalObject = Object.assign({}, myObj);
      let secondObject = {};

      for (let o of inspectobj) {
        if (finalObject.hasOwnProperty(o.userName)) {
          secondObject[o.userName] = o.landUse[i];
        }
      }

      let later = {
        year: this.info.point.years[i],
        classConsolidated: this.info.point.classConsolidated[i],
      };

      let fin = Object.assign({}, later, secondObject);

      arrData.push(fin);
    }

    // let obj = this.info.point.reduce((ac,a) => ({...ac,[a]:''}),{});


    this.usersInspectionsTable.settings = {
      // mode: 'inline',
      hideSubHeader: true,
      edit: {
        confirmSave: true,
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      actions: {
        position: 'left',
        add: false,
        delete: false,
        edit: true,
      },
      columns: myObj,
    };

    this.usersInspectionsTable.data = arrData;

    this.usersInspectionsTable.source = new LocalDataSource();

    this.isDataTableAvailable = true;
  }

  async isInspected() {
    this.id = this.route.snapshot.params['campaignId'];
    this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
      this.campaign = data;
      if (this.campaign.status !== 'READY') {
        this.router.navigateByUrl('pages/campaign/index');
        this.showToast('danger', 'Campaign has not started to be inspected!', 'top-right');
      } else {
        this.getPoint();
      }
    });
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
    this.themeSubscription.unsubscribe();
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

  showImage(image) {
    this.image = image;
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
      dates.push(new Date(this.imagesWet[i].date));
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

  initModisChart() {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      const colors: any = config.variables;
      const chartjs: any = config.variables.chartjs;
      this.campaignService.returnNDVISeries(this.info.point.lon, this.info.point.lat).subscribe(
        result => {
          this.tmpModis = result;
        },
        err => {
          // console.log('Error: ', err);
        },
        () => {

          this.modisChart.data = {
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
            ],
          };

          this.modisChart.options = {
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
                  time: {
                    tooltipFormat: 'DD/MM/YYYY', // <- HERE
                  }
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

          this.modisChart.type = 'line';

          this.isModisAvailable = true;
        });
    });
  }


}
