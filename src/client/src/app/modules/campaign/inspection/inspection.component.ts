import {Component, OnDestroy, OnInit} from '@angular/core';
import {CampaignService} from '../service/campaign.service';
import {PointService} from '../service/point.service';
import {Campaign} from '../models/campaign';
import {ActivatedRoute, Router} from '@angular/router';
import {
    NbComponentSize,
    NbComponentStatus,
    NbMediaBreakpointsService,
    NbSidebarService,
    NbThemeService,
    NbToastrService,
} from '@nebular/theme';
import {User} from '../models/user';
import {Subject} from 'rxjs';
import {Camera, SecurityCamerasData} from '../../../@core/data/security-cameras';
import {map} from 'rxjs/operators';
import {LayoutService} from '../../../@core/utils';
import {TranslateService} from '@ngx-translate/core';
import {normalizeString} from '../../../utilities/string.util';

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
    isDataAvailableTimeSeries = false as boolean;
    settings: any;

    dataChart: any;
    options: any;
    themeSubscription: any;
    tmpLandsat: any;

    constructor(
        private themeService: NbThemeService,
        private breakpointService: NbMediaBreakpointsService,
        private securityCamerasService: SecurityCamerasData,
        public campaignService: CampaignService,
        public router: Router,
        private theme: NbThemeService,
        public route: ActivatedRoute,
        public toastService: NbToastrService,
        private layoutService: LayoutService,
        private sidebarService: NbSidebarService,
        private pointService: PointService,
        public translate: TranslateService,
    ) {
        this.isDataAvailableTimeSeries = false;
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
            if (this.hasPermission(this.campaign.UsersOnCampaigns)) {
                if (this.campaign.status !== 'READY') {
                    this.router.navigateByUrl('modules/campaign/index');
                    this.showToast('danger', this.translate.instant('campaign_inspection_msg_not_ready'), 'top-right');
                } else {
                    this.getPoint();
                }
            } else {
                this.router.navigateByUrl('modules/campaign/index');
                this.showToast('danger', this.translate.instant('campaign_inspection_msg_not_has_permission'), 'top-right');
            }
        });
    }

    hasPermission(usersCampaign) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (usersCampaign.length > 0) {
            const userAllowed = usersCampaign.find(user => user.userId === currentUser.id);
            if (userAllowed && userAllowed.typeUserInCampaign === 'INSPETOR') {
                return true;
            }
        }
        return false;
    }

    async getPoint() {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const user = this.normalizeUser(currentUser);
        const senha = `${normalizeString(this.campaign.name)}_xpto`;
        const campanha = {...this.campaign};
        delete campanha.points;
        const access = {campaign: this.campaign.id, name: user, senha: senha};
        this.login = await this.pointService.login(access).toPromise();
        currentUser.name = user;
        const pointInfo = await this.pointService.getPointToInpection(campanha.id, currentUser.id).toPromise();
        this.info = pointInfo;
        this.points.push([Number(pointInfo.longitude), Number(pointInfo.latitude)]);
        this.center.push(Number(pointInfo.longitude));
        this.center.push(Number(pointInfo.latitude));
        this.initFormViewVariables();
        this.generateOptionYears(this.login.campaign.initialYear, this.login.campaign.finalYear);
        this.generateImages();
        this.landsatChart(pointInfo.longitude, pointInfo.latitude);
        this.initCounter();
    }

    async loadNextPoint(formPoint) {
        this.points = [];
        this.center = [];
        this.extent = [];
        this.info = {};
        this.info = await this.pointService.getNextPoint({'point': formPoint}).toPromise();
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
        this.landsatChart(this.info.point.lon.toString(), this.info.point.lat.toString());
        this.initCounter();
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
            this.imagesDry.push({
                date: `${year}`,
                year: year,
                url: null,
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
            this.imagesWet.push({
                date: `${year}`,
                year: year,
                url: null,
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
        const duration = 10000;
        setTimeout(() => this.toastService.show(status, massage, {status, position, duration}), 800);

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

        if (this.answers[prevIndex].finalYear === this.login.campaign.finalYear)
            return;
        const finalYear = this.login.campaign.finalYear;

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
                counter: this.counter,
                form: this.answers,
            },
        };
        this.onSubmission = true;
        this.isDataAvailable = false;
        this.loadNextPoint(formPoint);
    }

    initCounter() {
        this.counter = 0;
        setInterval(() => this.counter++, 1000);
    }

    landsatChart(lon, lat) {
        this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
            const colors: any = config.variables;
            const chartjs: any = config.variables.chartjs;
            this.campaignService.getLandSatTimeSeries(lon, lat).subscribe(
                result => {
                    this.tmpLandsat = result;
                    this.isDataAvailableTimeSeries = true;
                },
                err => {
                    console.error('Error: ', err);
                    this.isDataAvailableTimeSeries = false;
                },
                () => {

                    // Definindo os dados dos gráficos
                    this.dataChart = {
                        labels: this.tmpLandsat[0].x, // Assumindo que os eixos 'x' são os mesmos para todos os datasets
                        datasets: [
                            {
                                data: this.tmpLandsat[0].y, // NDVI (Savgol)
                                label: 'NDVI (Savgol)',
                                borderColor: this.tmpLandsat[0].line.color,
                                fill: false,
                                pointRadius: 1,
                                pointHoverRadius: 3,
                                pointStyle: 'rect',
                                type: this.tmpLandsat[0].type,
                                hidden: false,
                            },
                            {
                                data: this.tmpLandsat[1].y, // NDVI (Original)
                                label: 'NDVI (Original)',
                                backgroundColor: this.tmpLandsat[1].marker.color,
                                borderColor: this.tmpLandsat[1].marker.color,
                                pointRadius: 5,
                                type: this.tmpLandsat[1].type,
                                fill: false,
                                hidden: false,
                            },
                            {
                                data: this.tmpLandsat[2].y, // Precipitação
                                label: 'Precipitation',
                                backgroundColor: this.tmpLandsat[2].marker.color,
                                type: this.tmpLandsat[2].type,
                                yAxisID: 'y2', // Usando o segundo eixo Y
                            },
                        ],
                    };

                    // Definindo as opções do gráfico
                    this.options = {
                        responsive: true,
                        maintainAspectRatio: false,
                        tooltips: {
                            mode: 'index',
                            intersect: true,
                        },
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    display: true,
                                    color: chartjs.axisLineColor,
                                },
                                ticks: {
                                    fontColor: chartjs.textColor,
                                    autoSkip: true,
                                },
                                type: 'time',
                            }],
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
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'NDVI',
                                    },
                                },
                                {
                                    id: 'y2',
                                    position: 'right',
                                    gridLines: {
                                        display: false,
                                    },
                                    ticks: {
                                        fontColor: chartjs.textColor,
                                        autoSkip: true,
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Precipitation',
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
                },
            );
        });
    }

}
