import {Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {CampaignService} from '../service/campaign.service';
import {Campaign} from '../models/campaign';
import {Router, ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {NbWindowService} from '@nebular/theme';
import {NbDialogService} from '@nebular/theme';
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
import {LocalDataSource} from 'ng2-smart-table';
import {PointService} from '../service/point.service';
import {TranslateService} from '@ngx-translate/core';
import {NbIconLibraries} from '@nebular/theme';
import {result} from '../inspection/results';
import {FilterService} from '../service/filter.service';
import {FiltersFormComponent} from '../../../@theme/components';
import {PlanetService} from '../service/planet.service';

@Component({
    selector: 'ngx-result',
    templateUrl: './result.component.html',
    styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    id: number;
    login = {} as any;
    result = {} as any;
    infoP = {} as any;
    points = [] as any[];
    currentPoint: number = 0;
    pointsCollection = [] as any[];
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
    imagesSentinel = [] as any[];
    imagesPlanet = [] as any[];
    cameras: Camera[];
    image = 'DRY';
    answers = [] as any[];
    counter = 0 as number;
    optionYears = [] as any[];
    actionSize: NbComponentSize = 'medium';
    campaign = {} as Campaign;
    camp = {} as any;
    point = {} as any;
    user = {} as User;
    isDataAvailable = false as boolean;
    isModisAvailable = false as boolean;
    isDataTableAvailable = false as boolean;
    usersInspectionsTable = {data: [], settings: {}, source: new LocalDataSource()};
    pointsUsersInfoTable = {data: [], settings: {}, source: new LocalDataSource()};

    modisChart = {data: {}, options: {}, type: 'line'};
    themeSubscription: any;
    tmpModis: any;
    showTimelapse: boolean = false;
    la_timelapse: string;
    pl_timelapse: string;
    s2_timelapse: string;
    tmpLandsat: any;
    dataChart: any;
    options: any;
    isDataAvailableTimeSeries = false as boolean;
    initialYear: number;
    finalYear: number;
    filterSubscription: any;
    planetMosaics: any[] = [];
    sentinelCapabilities: any;
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
        private datePipe: DatePipe,
        public translate: TranslateService,
        private iconLibraries: NbIconLibraries,
        private windowService: NbWindowService,
        private dialogService: NbDialogService,
        private filterService: FilterService,
        private planetService: PlanetService,
    ) {
        this.sidebarService.compact('menu-sidebar');
        this.iconLibraries.registerSvgPack('geo', {
            'point': '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="map-marker-alt" class="svg-inline--fa fa-map-marker-alt fa-w-12" role="img" viewBox="0 0 384 512"><path fill="currentColor" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>',
        });
        const currentYear = new Date().getFullYear();
        this.sentinelCapabilities = {
            'name': 's2_harmonized',
            'visparam': ['tvi-green', 'tvi-red', 'tvi-rgb'],
            'period': ['WET', 'DRY', 'MONTH'],
            'year': Array.from({length: currentYear - 2019 + 1}, (_, i) => 2019 + i),
            'month': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        };
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.params['campaignId'];
        const breakpoints = this.breakpointService.getBreakpointsMap();
        this.themeService.onMediaQueryChange()
            .pipe(map(([, breakpoint]) => breakpoint.width))
            .subscribe((width: number) => {
                this.actionSize = width > breakpoints.md ? 'medium' : 'small';
            });
        this.isInspecting();
        if (this.filterSubscription) {
            this.filterSubscription.unsubscribe();
        }
        this.getPlanetMosaics();
    }
    getPlanetMosaics(): void {
        this.planetService.getMosaics().subscribe(mosaics => {
            if (mosaics && mosaics.length > 0) {
                this.planetMosaics = mosaics.map(mosaic => ({
                    ...mosaic,
                    tiles: mosaic._links.tiles,
                    firstAcquired: new Date(mosaic.first_acquired),
                    lastAcquired: new Date(mosaic.last_acquired),
                }));
            }
            this.getPoints();
        });
    }
    filterMosaicsForYear(year: number){
        return this.planetMosaics.filter(mosaic => {
            const firstYear = new Date(mosaic.firstAcquired).getFullYear();
            const lastYear = new Date(mosaic.lastAcquired).getFullYear();
            return year >= firstYear && year <= lastYear;
        });
    }
    hasPlanetMosaicForYear(year): boolean {
        return this.planetMosaics.some(mosaic => {
            const firstYear = mosaic.firstAcquired.getFullYear();
            const lastYear = mosaic.lastAcquired.getFullYear();
            return year >= firstYear && year <= lastYear;
        });
    }

    async getPoints() {
        this.id = this.route.snapshot.params['campaignId'];
        this.pointService.getPoints(this.id).subscribe((data) => {
            this.pointsCollection = data;
            this.currentPoint = data[0].index;
            this.getPoint();
        });

    }

    isInspecting() {
        this.id = this.route.snapshot.params['campaignId'];
        this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
            this.campaign = data;
            this.initialYear = new Date(this.campaign.initialDate).getFullYear();
            this.finalYear = new Date(this.campaign.finalDate).getFullYear();
            if (this.campaign.status !== 'READY') {
                this.router.navigate(['/modules/campaign/index']);
                this.showToast('danger', this.translate.instant('campaign_result_msg_not_start_inspect'), 'top-right');
            } else {
                this.getPlanetMosaics();
            }
        });
    }

    showBestImages(img: { year: number }) {
        this.imagesPlanet = [];
        this.imagesSentinel = [];
        this.imagesPlanet = this.filterMosaicsForYear(img.year);
         // Limpa o array antes de adicionar as novas imagens

        // Usaremos apenas o visparam 'tvi-red'
        const visparam = 'tvi-red';

        // Obtém o ano e o mês atual
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // O mês é baseado em zero, então somamos 1

        // Itera pelos períodos disponíveis no sentinelCapabilities
        this.sentinelCapabilities.period.forEach(periodOrMonth => {
            // Apenas processa os meses se o período for "MONTH"
            if (periodOrMonth === 'MONTH') {
                this.sentinelCapabilities.month.forEach(month => {
                    const numericMonth = parseInt(month, 10); // Converte o mês para um número
                    // Verifica se o mês não é futuro no ano atual
                    if (img.year < currentYear || (img.year === currentYear && numericMonth <= currentMonth)) {
                        const url = `https://tm{1-5}.lapig.iesa.ufg.br/api/layers/s2_harmonized/{x}/{y}/{z}?period=MONTH&year=${img.year}&visparam=${visparam}&month=${month}`;
                        this.imagesSentinel.push({
                            year: img.year,
                            month,
                            period: periodOrMonth,
                            visparam,
                            url,
                        });
                    }
                });
            }
        });
    }

    getPoint() {
        this.points = [];
        this.center = [];
        this.imagesPlanet = [];
        this.imagesSentinel = [];
        this.isDataAvailable = false;
        if (this.filterSubscription) {
            this.filterSubscription.unsubscribe();
        }
        this.point = this.pointService.point(this.currentPoint).subscribe((pointInfo) => {
            this.point = pointInfo;
            this.points.push([Number(this.point.longitude), Number(this.point.latitude)]);
            this.center.push(Number(this.point.longitude));
            this.center.push(Number(this.point.latitude));
            this.landUses = this.camp.landUse;
            this.pointService.getPointResult({
                campaignId: this.id,
                index: this.point.index,
            }).subscribe({
                next: value => {
                    this.result = value;
                },
                error: error => {
                    this.showToast('danger', error, 'top-right');
                },
            });
            this.generateOptionYears(this.initialYear, this.finalYear);
            this.getUsersInspections();
            // this.getPointsUsersInformations();
            this.generateImages();
            this.landsatChart(this.point.longitude, this.point.latitude);
        }, error => {
            this.showToast('danger', error, 'top-right');
            this.router.navigateByUrl('modules/campaign/index').then(r => {
            });
        });
    }

    getPointsUsersInformations() {
        const information = this.point.dataPointTime;

        this.pointsUsersInfoTable.settings = {
            // mode: 'inline',
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            actions: false,
            columns: {
                user: {
                    title: this.translate.instant('campaign_result_table_points_column_user'),
                    filter: true,
                },
                duration: {
                    title: this.translate.instant('campaign_result_table_points_column_duration'),
                    filter: false,
                    type: 'text', class: 'align-center',
                },
                meantime: {
                    title: this.translate.instant('campaign_result_table_points_column_meantime'),
                    filter: false,
                },
            },

        };

        const arrData = [];

        if (Array.isArray(information)) {
            for (let i = 0; i < information.length; i++) {

                arrData.push({
                    user: (information[i].name === 'Tempo médio' ? 'Average Time' : information[i].name),
                    duration: information[i].totalPointTime + ' secs',
                    meantime: parseFloat(information[i].meanPointTime).toFixed(1) + ' secs',
                });
            }
        }

        this.pointsUsersInfoTable.data = arrData;

        this.pointsUsersInfoTable.source = new LocalDataSource();

        this.isDataTableAvailable = true;
    }

    getUsersInspections() {
        const inspectobj = this.point.inspections; // assuming point contains 'inspections'
        const columns = {};
        const classesList = [];

        // Populate the list for classConsolidated editor from this.campaign.classes
        for (const land of this.campaign.classes) {
            classesList.push({ value: land.id, title: land.name });
        }

        // Inspector (interpreter) column as the first column
        columns['inspector'] = {
            title: this.translate.instant('campaign_result_table_points_column_user'),
            filter: false,
            editable: false,
        };

        // Consolidated class column
        columns['classConsolidated'] = {
            title: this.translate.instant('campaign_result_table_users_column_class_consolidated'),
            editable: true,
            type: 'html',
            editor: {
                type: 'list',
                config: { list: classesList },
            },
        };

        // Get unique years from inspections and add them as columns
        const years = [...new Set(inspectobj.map(inspection => new Date(inspection.date).getFullYear()))];

        // Add year columns
        years.forEach((year: number) => {
            columns[year] = {
                title: `${year}`,
                filter: false,
                editable: false,
            };
        });

        const arrData = [];

        // Get unique inspectors
        const inspectors = [...new Set(inspectobj.map(inspection => inspection.inspector.name))];

        // Populate rows based on the inspectors and their inspections for each year
        inspectors.forEach(inspectorName => {
            const rowData = { classConsolidated: null }; // Start with classConsolidated column

            // Set inspector (interprete) name in the row
            rowData['inspector'] = inspectorName;

            // Set inspector data for each year
            years.forEach((year: number) => {
                const inspectionForYear = inspectobj.find(inspection =>
                    new Date(inspection.date).getFullYear() === year && inspection.inspector.name === inspectorName
                );
                rowData[year] = inspectionForYear ? inspectionForYear.useClass.name : '-'; // Use '-' if no data
                rowData['classConsolidated'] = inspectionForYear ? inspectionForYear.useClass.name : null; // Adjust as needed
            });

            arrData.push(rowData);
        });

        // Setup table settings
        this.usersInspectionsTable.settings = {
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            edit: {
                confirmSave: true,
                editButtonContent: '<i class="nb-edit"></i>',
                saveButtonContent: '<i class="nb-checkmark"></i>',
                cancelButtonContent: '<i class="nb-close"></i>',
            },
            actions: {
                columnTitle: this.translate.instant('tables_actions'),
                position: 'right',
                add: false,
                delete: false,
                edit: true,
            },
            columns: columns, // Columns will be in the order they are added: inspector, classConsolidated, then years
        };

        // Set the table data
        this.usersInspectionsTable.data = arrData;
        this.usersInspectionsTable.source = new LocalDataSource(arrData);

        // Indicate the data table is available
        this.isDataTableAvailable = true;
    }


    satelliteByYear(year) {
        let satellite = 'L7';
        if (year > 2012) {
            satellite = 'L8';
        } else if (year > 2011) {
            satellite = 'L7';
        } else if (year > 2003 || year < 2000) {
            satellite = 'L5';
        }
        return satellite;
    }

    normalize(string) {
        const temp = string.replace(/\s+/g, '_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return (temp.slice(temp.length - 1) === '_') ? temp.substring(0, temp.length - 1) : temp;
    }

    hasMonthlyImages(year) {
        const images = [];
        return images;
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
                hasMonthlyImages: this.hasPlanetMosaicForYear(year),
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
                hasMonthlyImages: this.hasPlanetMosaicForYear(year),
            });
        }
        this.isDataAvailable = true;
    }

    formatDate(date) {
        return this.datePipe.transform(date, this.translate.instant('campaign_result_date_format'));
    }

    prev() {
        const point = this.currentPoint - 1;
        if (point >= 1) {
            this.currentPoint = point;
            this.getPoint();
        }
    }

    next() {
        const point = this.currentPoint + 1;
        if (point <= this.pointsCollection.length) {
            this.currentPoint = point;
            this.getPoint();
        }
    }

    search(point) {
        this.currentPoint = point;
        this.getPoint();
    }

    openWindowFilters() {
        this.windowService.open(FiltersFormComponent, {title: 'Filtros', windowClass: 'window-filter'});
        this.filterSubscription = this.filterService.filterData$.subscribe(filterData => {
            if (filterData) {
                this.currentPoint = filterData.pointId;
                this.getPoint();
            }
        });
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

    showToast(status: NbComponentStatus, massage, position) {
        const duration = 4000;
        setTimeout(() => this.toastService.show(status, massage, {status, position, duration}), 1000);
    }

    async onSaveConfirm(event) {
        if (window.confirm(this.translate.instant('campaign_result_msg_edit_class_consolidated'))) {
            event.confirm.resolve(event.newData);

            const ob = {
                index: event.newData.index,
                class: event.newData.classConsolidated,
                _id: this.infoP.current + '_' + this.camp._id,
            };

            const t = await this.pointService.updateSingleClassConsolidated(ob).toPromise();


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
