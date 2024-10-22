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
import {result} from './results';

@Component({
    selector: 'ngx-inspection',
    templateUrl: './inspection.component.html',
    styleUrls: ['./inspection.component.scss'],
})
export class InspectionComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    id: number;
    login = {} as any;
    point = {} as any;
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
    initialYear: number;
    finalYear: number;

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
            this.initialYear = new Date(this.campaign.initialDate).getFullYear();
            this.finalYear = new Date(this.campaign.finalDate).getFullYear();
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

    getPoint() {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const campanha = {...this.campaign};
        this.pointService.getPointToInpection(campanha.id, currentUser.id).subscribe(    (pointInfo) => {
            this.point = pointInfo;
            this.points.push([Number(pointInfo.longitude), Number(pointInfo.latitude)]);
            this.center.push(Number(pointInfo.longitude));
            this.center.push(Number(pointInfo.latitude));
            this.initFormViewVariables();
            this.generateOptionYears(this.initialYear, this.finalYear);
            this.generateImages();
            this.landsatChart(pointInfo.longitude, pointInfo.latitude);
            this.initCounter();
        }, error => {
            this.showToast('danger', error, 'top-right');
            this.router.navigateByUrl('modules/campaign/index').then(r => {});
        });

    }

    async loadNextPoint(formPoint) {
        this.points = [];
        this.center = [];
        this.extent = [];
        this.isDataAvailable = false;
        this.isDataAvailableTimeSeries = false;
        await this.pointService.getNextPoint({'point': formPoint}).toPromise();
    }

    generateImages() {
        const initialYear = new Date(this.campaign.initialDate).getFullYear();
        const finalYear = new Date(this.campaign.finalDate).getFullYear();
        this.imagesDry = [];
        this.imagesWet = [];
        for (let year = initialYear; year <= finalYear; year++) {
            let sattelite = 'L7';
            if (year > 2012) {
                sattelite = 'L8';
            } else if (year > 2011) {
                sattelite = 'L7';
            } else if (year > 2003 || year < 2000) {
                sattelite = 'L5';
            }

            const tmsIdDry = sattelite + '_' + year + '_DRY';
            this.tmsIdListDry.push(tmsIdDry);
            this.imagesDry.push({
                year: year,
            });
        }

        for (let year = initialYear; year <= finalYear; year++) {
            let sattelite = 'L7';
            if (year > 2012) {
                sattelite = 'L8';
            } else if (year > 2011) {
                sattelite = 'L7';
            } else if (year > 2003 || year < 2000) {
                sattelite = 'L5';
            }
            const tmsIdWet = sattelite + '_' + year + '_WET';
            this.tmsIdListWet.push(tmsIdWet);
            this.imagesWet.push({
                year: year,
            });
        }
        this.isDataAvailable = true;
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
    initFormViewVariables() {
        this.optionYears = [];
        const landUseIndex = 0;
        this.answers = [
            {
                initialYear: this.initialYear,
                finalYear: this.finalYear,
                class: this.campaign.classes[landUseIndex],
                pixelBorder: false,
            },
        ];
    }

    formPlus() {
        const prevIndex = this.answers.length - 1;
        const initialYear = this.answers[prevIndex].finalYear + 1;
        const finalYear = new Date(this.campaign.finalDate).getFullYear();

        if (this.answers[prevIndex].finalYear === finalYear)
            return;
        this.generateOptionYears(initialYear, finalYear);
        this.answers.push(
            {
                initialYear: initialYear,
                finalYear: finalYear,
                class: this.answers[prevIndex].class,
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
        // Inicialmente, cria uma lista de todos os anos no intervalo entre initialYear e finalYear
        const allYears: number[] = [];
        for (let year = this.initialYear; year <= this.finalYear; year++) {
            allYears.push(year);
        }

        // Mapeia as respostas atuais em um formato que associa o intervalo de anos
        const selectedYears = [];
        this.answers.forEach(answer => {
            for (let year = answer.initialYear; year <= answer.finalYear; year++) {
                selectedYears.push({
                    year,
                    class: answer.class.id,  // Supondo que `class` tenha um `id`
                });
            }
        });

        // Preenche automaticamente os anos faltantes no array de inspeções
        const inspections = allYears.map(year => {
            const existing = selectedYears.find(entry => entry.year === year);
            return {
                duration: null,  // Cria uma nova data com base no ano
                typePeriod: 'YEARLY',  // Usa o valor do período selecionado
                date: new Date(Date.UTC(year, 11, 31, 22, 0, 0)),
                useClassId:  existing.class,
                inspectorId: JSON.parse(localStorage.getItem('user')).id,  // ID do usuário logado
            };
        });

        // Divide o contador pelo número de inspeções e atribui o valor a cada uma
        const counterPerInspection = this.counter / inspections.length;
        inspections.forEach(inspection => {
            inspection.duration = counterPerInspection;
        });

        // Preparar o ID do ponto e as inspeções para o envio
        const pointId = this.point.id;

        this.pointService.saveInspections(pointId, inspections).subscribe(
            response => {
                this.onSubmission = true;
                this.isDataAvailable = false;
                this.showToast('success', 'Inspections saved successfully', 'top-right');
                setTimeout(() => {
                    this.getPoint();
                }, 1000);
            },
            error => {
                console.error('Error saving inspections', error);
                this.showToast('danger', 'Erro ao salvar as inspeções', 'top-right');
            },
        );
    }


    initCounter() {
        this.counter = 0;
        setInterval(() => this.counter++, 1000);
    }
    configChart() {
        this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
            const colors: any = config.variables;
            const chartjs: any = config.variables.chartjs;
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
                        type: 'line',
                        hidden: false,
                    },
                    {
                        data: this.tmpLandsat[1].y, // NDVI (Original)
                        label: 'NDVI (Original)',
                        backgroundColor: this.tmpLandsat[1].marker.color,
                        borderColor: this.tmpLandsat[1].marker.color,
                        type: this.tmpLandsat[1].type,
                        fill: false,
                        hidden: false,
                        pointRadius: 1,
                        pointHoverRadius: 3,
                        pointStyle: 'rect',
                    },
                    // {
                    //     data: this.tmpLandsat[2].y, // Precipitação
                    //     label: 'Precipitation (mm)',
                    //     backgroundColor: this.tmpLandsat[2].marker.color,
                    //     borderColor: this.tmpLandsat[2].marker.color,
                    //     type: 'bar',
                    //     stack: 'combined',
                    //     yAxisID: 'y2',
                    // },
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
                            position: 'right', // Posicionando o eixo Y2 à direita
                            scaleLabel: {
                                display: true,
                                labelString: 'Precipitation (mm)', // Rótulo para precipitação
                            },
                            gridLines: {
                                display: false, // Ocultando as linhas de grade do eixo Y2
                            },
                            type: 'linear', // Mantém o tipo de escala linear
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
    }

    landsatChart(lon, lat) {
        this.campaignService.getLandSatTimeSeries(lon, lat).subscribe(
            _result => {
                this.tmpLandsat = result;
                this.isDataAvailableTimeSeries = true;
            },
            err => {
                console.error('Error: ', err);
                this.isDataAvailableTimeSeries = false;
            },
            () => {
                this.configChart();
            },
        );
    }

}
