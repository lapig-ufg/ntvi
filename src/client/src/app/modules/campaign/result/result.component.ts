import {Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {CampaignService} from '../service/campaign.service';
import {Campaign} from '../models/campaign';
import {Router, ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {NbWindowService} from '@nebular/theme';
import { NbDialogService } from '@nebular/theme';
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
import {BestImagesComponent, DialogComponent, FiltersComponent} from '../../../@theme/components';

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
    ) {
        this.sidebarService.compact('menu-sidebar');
        this.iconLibraries.registerSvgPack('geo', {
            'point': '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="map-marker-alt" class="svg-inline--fa fa-map-marker-alt fa-w-12" role="img" viewBox="0 0 384 512"><path fill="currentColor" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>',
        });
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
    }

    async getPoints() {
        this.id = this.route.snapshot.params['campaignId'];
        this.pointService.getPoints(this.id).subscribe((data) => {
            this.pointsCollection = data;
            this.currentPoint = data[0].index;
            this.getPoint();
        });

    }

    async isInspecting() {
        this.id = this.route.snapshot.params['campaignId'];
        this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
            this.campaign = data;
            if (this.campaign.status !== 'READY') {
                this.router.navigate(['/modules/campaign/index']);
                this.showToast('danger', this.translate.instant('campaign_result_msg_not_start_inspect'), 'top-right');
            } else {
                this.getPoints();
            }
        });
    }

    showBestImages(images){
        this.imagesPlanet = images.filter(img => {
            return img.id.includes('PL')
        });
        this.imagesSentinel = images.filter(img => {
            return img.id.includes('S2')
        });

        // const data = {
        //     title: 'Imagens Mensais',
        //     imagesPlanet: images.filter(img => {
        //         return img.id.includes('PL')
        //     }),
        //     imagesSentinel: images.filter(img => {
        //         return img.id.includes('S2')
        //     })
        // }
        // this.dialogService.open(BestImagesComponent, { context: data}).onClose.subscribe();
    }

    async getPoint() {
        this.points = [];
        this.center = [];
        this.imagesPlanet = [];
        this.imagesSentinel = [];
        this.isDataAvailable = false
        this.camp = await this.pointService.getCampaign(this.id).toPromise();
        this.point = await this.pointService.point(this.id, this.currentPoint).toPromise();
        this.landUses = this.camp.landUse;
        this.result = await this.pointService.getPointResult({
            campaignId: this.id,
            index: this.point.index
        }).toPromise();

        this.la_timelapse = `/service/la_timelapse/${this.normalize(this.point._id)}/${this.camp._id}/${this.point.index}`;
        this.pl_timelapse = `/service/pl_timelapse/${this.normalize(this.point._id)}/${this.camp._id}/${this.point.index}`;
        this.s2_timelapse = `/service/s2_timelapse/${this.normalize(this.point._id)}/${this.camp._id}/${this.point.index}`;

        this.points.push([parseFloat(this.point.lon), parseFloat(this.point.lat)]);
        this.center.push(this.point.lon);
        this.center.push(this.point.lat);
        // this.extent.push(this.point.bounds[0][1]);
        // this.extent.push(this.point.bounds[1][0]);
        // this.extent.push(this.point.bounds[1][1]);
        // this.extent.push(this.point.bounds[0][0]);

        this.initFormViewVariables();
        this.generateOptionYears(this.camp.initialYear, this.camp.finalYear);
        this.getUsersInspections();
        this.getPointsUsersInformations();
        this.generateImages();
        // this.initModisChart();

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
        const inspectobj = this.point.inspection;
        const columns = new Object;
        const classesList = [];

        for (const land of this.landUses) {
            classesList.push({
                value: land, title: land,
            });
        }

        columns['year'] = {
            title: this.translate.instant('campaign_result_table_users_column_year'),
            filter: false,
            editable: false,
        };

        columns['classConsolidated'] = {
            title: this.translate.instant('campaign_result_table_users_column_class_consolidated'),
            editable: true,
            type: 'html',
            editor: {
                type: 'list',
                config: {
                    list: classesList,
                },
            },
        };

        const arrData = [];

        for (const o of inspectobj) {
            columns[o.userName] = {
                title: o.userName.toString(),
                filter: false,
                editable: false,
            };

        }

        if (this.point.hasOwnProperty('years')) {
            for (let i = 0; i < this.point.years.length; i++) {

                const finalObject = Object.assign({}, columns);
                const secondObject = {};

                for (const o of inspectobj) {
                    if (finalObject.hasOwnProperty(o.userName)) {
                        secondObject[o.userName] = o.landUse[i];
                    }
                }

                const later = {
                    index: i,
                    year: this.point.years[i],
                    classConsolidated: this.point.classConsolidated[i],
                };

                const fin = Object.assign({}, later, secondObject);

                arrData.push(fin);
            }
        }

        this.usersInspectionsTable.settings = {
            // mode: 'inline',
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
            columns: columns,
        };

        this.usersInspectionsTable.data = arrData;

        this.usersInspectionsTable.source = new LocalDataSource();

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
        const temp = string.replace(/\s+/g, '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return (temp.slice(temp.length - 1) === "_") ? temp.substring(0, temp.length - 1) : temp;
    }

    hasMonthlyImages(year){
        let images = [];

        if( this.point.mosaics.length > 0){
            this.point.mosaics.forEach(mosaic => {
                const isLandsat = !!(mosaic._id.includes('WET') || mosaic._id.includes('DRY'));
                if(this.point.hasOwnProperty('images_not_found')){
                    if (!this.point.images_not_found.includes(mosaic._id) && !isLandsat) {
                        let id = mosaic._id.split('_');
                        if (parseInt(id[3]) == year) {
                            const url = `/service/image/${mosaic._id}/${this.normalize(this.point._id)}/${this.camp._id}/${this.point.index}`;
                            const date = mosaic._id.includes('PL') ? mosaic.first_acquired : mosaic.date.start;
                            images.push({
                                id: mosaic._id,
                                pto: this.point,
                                date: date,
                                url: url,
                            });
                        }
                    }
                } else {
                    if (!isLandsat) {
                        let id = mosaic._id.split('_');
                        if (parseInt(id[3]) == year) {
                            const url = `/service/image/${mosaic._id}/${this.normalize(this.point._id)}/${this.camp._id}/${this.point.index}`;
                            const date = mosaic._id.includes('PL') ? mosaic.first_acquired : mosaic.date.start;
                            images.push({
                                id: mosaic._id,
                                pto: this.point,
                                date: date,
                                url: url,
                            });
                        }
                    }
                }

            });
        }

        return images;
    }

    generateImages() {
        this.imagesDry = [];
        this.imagesWet = [];
        this.point.mosaics.forEach(mosaic => {
            if (mosaic._id.includes('DRY')) {
                let id = mosaic._id.split('_');
                if (mosaic._id.includes(this.satelliteByYear(parseInt(id[2])))) {
                    const url = `/service/image/${mosaic._id}/${this.normalize(this.point._id)}/${this.camp._id}/${this.point.index}`;
                    this.imagesDry.push({
                        date: id[2] + '-01-01',
                        year: parseInt(id[2]),
                        hasMonthlyImages: this.hasMonthlyImages(parseInt(id[2])),
                        url: url,
                    });
                }
            }
        });
        this.point.mosaics.forEach(mosaic => {
            if (mosaic._id.includes('WET')) {
                let id = mosaic._id.split('_');
                if (mosaic._id.includes(this.satelliteByYear(parseInt(id[2])))) {
                    const url = `/service/image/${mosaic._id}/${this.normalize(this.point._id)}/${this.camp._id}/${this.point.index}`;
                    this.imagesWet.push({
                        date: id[2] + '-01-01',
                        year: parseInt(id[2]),
                        hasMonthlyImages: this.hasMonthlyImages(parseInt(id[2])),
                        url: url,
                    });
                }
            }
        });
        this.isDataAvailable = true;
    }

    formatDate(date) {
        return this.datePipe.transform(date, this.translate.instant('campaign_result_date_format'))
    }

    prev() {
        let point = this.currentPoint - 1;
        if (point >= 1) {
            this.currentPoint = point
            this.getPoint();
        }
    }

    next() {
        let point = this.currentPoint + 1;
        if (point <= this.pointsCollection.length) {
            this.currentPoint = point;
            this.getPoint();
        }
    }

    search(point){
        this.currentPoint = point;
        this.getPoint();
    }

    openWindowFilters() {
        this.windowService.open(FiltersComponent, {title: 'Filtros', windowClass: 'window-filter'});
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
                initialYear: this.camp.initialYear,
                finalYear: this.camp.finalYear,
                landUse: this.camp.landUse[landUseIndex],
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
                landUse: this.camp.landUse[1],
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
            _id: this.point._id,
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
            this.campaignService.returnNDVISeries(this.point.lon, this.point.lat).subscribe(
                result => {
                    this.tmpModis = result;
                    this.isDataAvailable = true;
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
                                        tooltipFormat: this.translate.instant('campaign_result_chart_date_format'), // <- HERE
                                    },
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
