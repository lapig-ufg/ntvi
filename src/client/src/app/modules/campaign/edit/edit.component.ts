import {Component, OnInit, ViewChild} from '@angular/core';
import {CampaignService} from '../service/campaign.service';
import {Campaign} from '../models/campaign';
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {Organization} from '../../organization/model/organization';
import {Satellite} from '../../satellite/model/satellite';
import {Composition} from '../models/composition';
import {UseClass} from '../../use-class/model/use-class';
import {Point} from '../models/point';
import {User} from '../models/user';
import {Image} from '../models/image';
import {UsersOnCampaigns} from '../models/usersOnCampaigns';
import {LocalDataSource} from 'ng2-smart-table';
import {SatelliteService} from '../../satellite/service/satellite.service';
import {OrganizationService} from '../../organization/service/organization.service';
import {UseClassService} from '../../use-class/service/use-class.service';
import {UserService} from '../service/user.service';
import {NbComponentStatus, NbToastrService} from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';
import {Country} from '../models/country';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
    selector: 'ngx-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
    id: number;
    campaign = {} as Campaign;
    infoForm: FormGroup;
    configForm: FormGroup;
    pointsForm: FormGroup;
    usersForm: FormGroup;
    imagesForm: FormGroup;
    organizations = [] as Organization[];
    satellites = [] as Satellite[];
    compositions = [] as Composition[];
    useClasses = [] as UseClass[];
    useClassesSelected = [] as UseClass[];
    points = [] as Point[];
    mapPoints = [] as any[];
    users = [] as User[];
    images = [] as Image[];
    UsersOnCampaigns = [] as UsersOnCampaigns[];
    loadingPoints = false as boolean;
    loadingForms = false as boolean;
    customImages = false as boolean;
    reviewCampaign: any;
    loadingThumb = false;
    thumbs = [];
    selectedThumb: any = {};
    isSingleView = false;

    permissions = [
        {id: 'ADMIN', name: 'ADMIN'},
        {id: 'INSPETOR', name: 'INSPETOR'},
        {id: 'SUPERVISOR', name: 'SUPERVISOR'},
    ];
    satellitesColors: any[] = [
        {id: 1, value: 'landsat-tvi-false'},
        {id: 1, value: 'landsat-tvi-true'},
        {id: 1, value: 'landsat-tvi-agri'},
        {id: 2, value: 'tvi-green'},
        {id: 2, value: 'tvi-red'},
        {id: 2, value: 'tvi-rgb'},
        {id: 3, value: '-'},
    ];
    colorsComposition = [];
    tablePoints = {
        settings: {
            mode: 'external',
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            actions: false,
            columns: {
                latitude: {
                    title: this.translate.instant('campaign_view_points_table_col_lat'),
                },
                longitude: {
                    title: this.translate.instant('campaign_view_points_table_col_lon'),
                },
                info: {
                    title: this.translate.instant('campaign_view_points_table_col_location'),
                },
            },
        },
        source: new LocalDataSource(),
    };
    tableUseClass = {
        settings: {
            mode: 'external',
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            actions: {
                position: 'right',
                edit: false,
                columnTitle: this.translate.instant('tables_actions'),
            },
            delete: {
                deleteButtonContent: '<i class="nb-trash"></i>',
                confirmDelete: false,
            },
            columns: {
                name: {
                    title: this.translate.instant('campaign_view_use_classes_table_col_name'),
                },
            },
        },
        source: new LocalDataSource(),
    };
    tableCompositions = {
        settings: {
            mode: 'external',
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            actions: {
                position: 'right',
                edit: false,
                columnTitle: this.translate.instant('tables_actions'),
            },
            delete: {
                deleteButtonContent: '<i class="nb-trash"></i>',
                confirmDelete: false,
            },
            columns: {
                satellite: {
                    title: this.translate.instant('campaign_view_colors_table_col_name'),
                    valuePrepareFunction: (satellite) => {
                        return satellite.name;
                    },
                },
                colors: {
                    title: this.translate.instant('campaign_view_colors_table_col_colors'),
                },
            },
        },
        source: new LocalDataSource(),
    };
    tableUseClassReview = {
        settings: {
            mode: 'external',
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            actions: false,
            delete: {
                deleteButtonContent: '<i class="nb-trash"></i>',
                confirmDelete: false,
            },
            columns: {
                name: {
                    title: this.translate.instant('campaign_view_use_classes_table_col_name'),
                },
            },
        },
        source: new LocalDataSource(),
    };
    tableCompositionsReview = {
        settings: {
            mode: 'external',
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            actions: false,
            delete: {
                deleteButtonContent: '<i class="nb-trash"></i>',
                confirmDelete: false,
            },
            columns: {
                satellite: {
                    title: this.translate.instant('campaign_view_colors_table_col_name'),
                    valuePrepareFunction: (satellite) => {
                        return satellite.name;
                    },
                },
                colors: {
                    title: this.translate.instant('campaign_view_colors_table_col_colors'),
                },
            },
        },
        source: new LocalDataSource(),
    };
    tableUsers = {
        settings: {
            mode: 'external',
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            actions: {
                position: 'right',
                edit: false,
                columnTitle: this.translate.instant('tables_actions'),
            },
            delete: {
                deleteButtonContent: '<i class="nb-trash"></i>',
                confirmDelete: false,
            },
            columns: {
                user: {
                    title: this.translate.instant('campaign_view_users_table_col_name'),
                    valuePrepareFunction: (user) => {
                        return user.name;
                    },
                },
                typeUserInCampaign: {
                    title: this.translate.instant('campaign_view_users_table_col_permission'),
                },
            },
        },
        source: new LocalDataSource(),
    };
    tableImages = {
        settings: {
            mode: 'external',
            hideSubHeader: true,
            noDataMessage: this.translate.instant('tables_no_data_msg'),
            actions: {
                position: 'right',
                edit: false,
                columnTitle: this.translate.instant('tables_actions'),
            },
            delete: {
                deleteButtonContent: '<i class="nb-trash"></i>',
                confirmDelete: false,
            },
            columns: {
                satellite: {
                    title: this.translate.instant('campaign_view_images_table_col_name'),
                    valuePrepareFunction: (satellite) => {
                        return satellite.name;
                    },
                },
                date: {
                    title: this.translate.instant('campaign_view_images_table_col_date'),
                },
                url: {
                    title: this.translate.instant('campaign_view_images_table_col_url'),
                },
            },
        },
        source: new LocalDataSource(),
    };
    countries: Country[];
    filteredCountries$: Observable<Country[]>;

    @ViewChild('country') country;
    @ViewChild('stepper') stepper;

    constructor(
        public campaignService: CampaignService,
        public satelliteService: SatelliteService,
        public organizationService: OrganizationService,
        public useClassService: UseClassService,
        public userService: UserService,
        public toastService: NbToastrService,
        public router: Router,
        public route: ActivatedRoute,
        public fb: FormBuilder,
        public translate: TranslateService,
    ) {
        this.reviewCampaign = {};
    }

    ngOnInit(): void {

        this.campaignService.getCampaignCountries().subscribe((data: Country[]) => {
            this.countries = data;
            this.filteredCountries$ = of(this.countries);
        });

        this.organizationService.getAll().subscribe((data: Organization[]) => {
            this.organizations = data;
        });

        this.satelliteService.getAll().subscribe((data: Satellite[]) => {
            this.satellites = data;
        });

        this.useClassService.getAll().subscribe((data: UseClass[]) => {
            this.useClasses = data;
        });

        this.userService.getAll().subscribe((data: User[]) => {
            const users: User[] = [];
            const user = JSON.parse(localStorage.getItem('user'));
            data.forEach(function (us) {
                if (us.id !== user.id) {
                    users.push(us);
                }
            });
            this.users = users;
        });

        this.infoForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            organization: ['', Validators.required],
            numInspectors: ['', Validators.required],
            country: ['', Validators.required],
        });

        this.configForm = this.fb.group({
            initialDate: ['', Validators.required],
            finalDate: ['', Validators.required],
            satellite: [],
            _colors: [],
            useClass: [],
        });

        this.pointsForm = this.fb.group({
            pointsFile: [],
        });

        this.usersForm = this.fb.group({
            user: [],
            permission: [],
        });

        this.imagesForm = this.fb.group({
            imgSatellite: [],
            dataImg: [],
            url: [],
        });

        this.loadFormInputs();
    }

    loadFormInputs() {
        this.id = this.route.snapshot.params['campaignId'];

        this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
            this.points = data.points;
            this.mapPoints = data.points.map(point => [point.longitude, point.latitude]);
            this.compositions = data.compositions;
            this.useClassesSelected = data.classes;

            this.campaign = data;
            this.tablePoints.source.empty();
            this.tablePoints.source.load(data.points);
            this.tableUseClass.source.empty();
            this.tableUseClass.source.load(data.classes);
            this.tableImages.source.empty();
            this.tableImages.source.load(data.images);
            this.tableUsers.source.empty();
            this.tableUsers.source.load(data.UsersOnCampaigns);
            this.UsersOnCampaigns = data.UsersOnCampaigns;
            this.tableCompositions.source.empty();
            this.tableCompositions.source.load(data.compositions);
            this.reviewCampaign.organizationId = data.organizationId.toString();
            this.infoForm.patchValue({
                name: data.name,
                description: data.description,
                organization: data.organizationId,
                numInspectors: data.numInspectors,
                country: data.country,
            });
            this.configForm.patchValue({
                initialDate: new Date(data.initialDate),
                finalDate: new Date(data.finalDate),
            });
        });
    }

    async addClass() {
        const useClassId = this.configForm.get('useClass').value;
        if (!useClassId) {
            this.showToast('danger', this.translate.instant('campaign_create_edit_msg_use_class'), 'top-right');
            return;
        }
        const useClass = this.useClasses.find(use => use.id === parseInt(useClassId, 0));
        this.useClassesSelected.push(useClass);
        this.configForm.patchValue({
            useClass: '',
        });
        this.tableUseClass.source.reset();
        await this.tableUseClass.source.load(this.useClassesSelected);
    }

    async addComposition() {
        const satelliteId = this.configForm.get('satellite').value;
        const colors: [] = this.configForm.get('_colors').value;
        if (!satelliteId) {
            this.showToast('danger', this.translate.instant('campaign_create_edit_msg_satellite'), 'top-right');
            return;
        }
        if (!colors || colors.length < 1) {
            this.showToast('danger', this.translate.instant('campaign_create_edit_msg_colors'), 'top-right');
            return;
        }
        const satellite = this.satellites.find(sat => sat.id === parseInt(satelliteId, 0));
        const composition = {
            colors: colors.toString(),
            satelliteId: satelliteId,
            satellite: satellite,
        };
        this.compositions.push(composition);
        this.configForm.patchValue({
            satellite: '',
            _colors: null,
        });
        this.tableCompositions.source.reset();
        await this.tableCompositions.source.load(this.compositions);
        this.getThumb();
    }

    async addUserOnCampaign() {
        const userId = this.usersForm.get('user').value;
        const permission = this.usersForm.get('permission').value;
        if (!userId) {
            this.showToast('danger', this.translate.instant('campaign_create_edit_msg_permission'), 'top-right');
            return;
        }
        if (!permission) {
            this.showToast('danger', this.translate.instant('campaign_create_edit_msg_permission_min'), 'top-right');
            return;
        }
        const user = this.users.find(us => us.id === parseInt(userId, 0));
        const userOnCampaign = {
            userId: userId,
            typeUserInCampaign: permission,
            user: user,
        };
        this.UsersOnCampaigns.push(userOnCampaign);
        this.usersForm.patchValue({
            user: '',
            permission: '',
        });
        this.tableUsers.source.reset();
        await this.tableUsers.source.load(this.UsersOnCampaigns);
    }

    async addImage() {
        const imgSatellite = this.imagesForm.get('imgSatellite').value;
        const dataImg = this.imagesForm.get('dataImg').value;
        const url = this.imagesForm.get('url').value;

        if (!imgSatellite) {
            this.showToast('danger', this.translate.instant('campaign_create_edit_msg_img_satellite'), 'top-right');
            return;
        }
        if (!dataImg) {
            this.showToast('danger', this.translate.instant('campaign_create_edit_msg_img_date'), 'top-right');
            return;
        }
        if (!url) {
            this.showToast('danger', this.translate.instant('campaign_create_edit_msg_img_url'), 'top-right');
            return;
        }
        const satellite = this.satellites.find(sat => sat.id === parseInt(imgSatellite, 0));

        const image = {
            date: dataImg,
            url: url,
            satelliteId: imgSatellite,
            satellite: satellite,
        };
        this.images.push(image);
        this.imagesForm.patchValue({
            imgSatellite: '',
            dataImg: '',
            url: '',
        });
        this.tableImages.source.reset();
        await this.tableImages.source.load(this.images);
    }

    async removeComposition(event) {
        const index = event.index;
        this.compositions = this.compositions.filter(function (item, i) {
            return i !== index;
        });
        if (this.thumbs.length > 0) {
            this.thumbs = this.thumbs.filter(thumb => thumb.satelliteId != event.data.satelliteId);
        }
        this.tableCompositions.source.reset();
        await this.tableCompositions.source.load(this.compositions);
    }

    async removeClass(event) {
        const index = parseInt(event.data.id, 0);
        this.useClassesSelected = this.useClassesSelected.filter(function (item, i) {
            return item.id !== index;
        });

        this.tableUseClass.source.reset();
        await this.tableUseClass.source.load(this.useClassesSelected);
    }

    async removeUserOnCampaign(event) {
        const index = event.index;
        this.UsersOnCampaigns = this.UsersOnCampaigns.filter(function (item, i) {
            return i !== index;
        });
        this.tableUsers.source.reset();
        await this.tableUsers.source.load(this.UsersOnCampaigns);
    }

    async removeImage(event) {
        const index = event.index;
        this.images = this.images.filter(function (item, i) {
            return i !== index;
        });
        this.tableImages.source.reset();
        await this.tableImages.source.load(this.images);
    }

    goTo(url) {
        this.router.navigateByUrl(url);
    }

    get fInfo() {
        return this.infoForm.controls;
    }

    get fConfig() {
        return this.configForm.controls;
    }

    get fPoints() {
        return this.pointsForm.controls;
    }

    get fUsers() {
        return this.usersForm.controls;
    }

    get fImages() {
        return this.imagesForm.controls;
    }

    onInfoFormSubmit() {
        // this.infoForm.markAsDirty();
        this.campaignService.update(this.id, this.infoForm.value).subscribe(res => {
            this.campaign = res;
            this.loadingForms = false;
            this.stepper.next();
        }, error => {
            this.loadingForms = false;
            this.showToast('danger', this.translate.instant('error_msg'), 'top-right');
        });

    }

    onConfigFormSubmit() {
        // this.configForm.markAsDirty();
        this.campaign.initialDate = this.configForm.get('initialDate').value.toISOString();
        this.campaign.finalDate = this.configForm.get('finalDate').value.toISOString();

        const auxUseClasses = [];

        for (const ob of this.useClassesSelected) {
            auxUseClasses.push({id: ob.id});
        }

        const auxCompositions = [];

        for (const ob of this.compositions) {
            auxCompositions.push({
                satellite: ob.satellite.id,
                colors: ob.colors,
            });
        }

        this.campaign.compositions = auxCompositions;
        this.campaign.classes = auxUseClasses;
        this.loadingPoints = true;
        setTimeout(() => this.loadingPoints = false, 600);
        this.campaignService.createConfigForm(this.campaign).subscribe(res => {
            this.loadingForms = false;
            this.stepper.next();
        }, error => {
            this.loadingForms = false;
            this.showToast('danger', this.translate.instant('error_msg'), 'top-right');
        });
    }

    onPointsFormSubmit() {
        // this.pointsForm.markAsDirty();
        this.loadingForms = true;
        this.campaign.points = (this.points.length > 0 ? this.points : null);
        this.campaign.points
        this.campaignService.updatePointsForm(this.campaign).subscribe(res => {
            this.loadingForms = false;
            this.stepper.next();
        }, error => {
            this.loadingForms = false;
            this.showToast('danger', this.translate.instant('error_msg'), 'top-right');
        });
    }

    onUsersFormSubmit() {
        // this.pointsForm.markAsDirty();

        this.campaign.UsersOnCampaigns = this.UsersOnCampaigns;

        this.campaignService.updateUsersOnCampaignForm(this.campaign).subscribe(res => {
            this.loadingForms = false;
            this.stepper.next();
        }, error => {
            this.loadingForms = false;
            this.showToast('danger', this.translate.instant('error_msg'), 'top-right');
        });
        this.loadInputs();
    }

    onImagesFormSubmit() {
        // this.imagesForm.markAsDirty();

        this.campaign.images = (this.images.length > 0 ? this.images : null);

        this.campaignService.createImagesForm(this.campaign).subscribe(res => {
            this.loadingForms = false;
            this.stepper.next();
        }, error => {
            this.loadingForms = false;
            this.showToast('danger', this.translate.instant('error_msg'), 'top-right');
        });
        this.loadInputs();
    }

    showToast(status: NbComponentStatus, massage, position) {
        const duration = 4000;
        setTimeout(() => this.toastService.show(status, massage, {status, position, duration}), 900);
    }

    getThumb() {
        this.loadingThumb = true;
        const camp = this.campaign;
        camp.compositions = this.compositions;
        this.campaignService.thumb(this.campaign).subscribe(res => {
            this.thumbs = res;
            setTimeout(() => this.loadingThumb = false, 3000);
        }, error => {
            this.loadingThumb = false;
            this.showToast('danger', this.translate.instant('error_msg'), 'top-right');
        });
    }

    onMapReady(ev) {
        // console.log(ev)
    }

    async loadInputs() {
        this.reviewCampaign.name = this.infoForm.get('name').value;
        this.reviewCampaign.description = this.infoForm.get('description').value;
        this.reviewCampaign.organizationId = this.infoForm.get('organization').value;
        this.reviewCampaign.numInspectors = this.infoForm.get('numInspectors').value;
        this.reviewCampaign.country = this.infoForm.get('country').value;
        this.reviewCampaign.initialDate = this.configForm.get('initialDate').value;
        this.reviewCampaign.finalDate = this.configForm.get('finalDate').value;
        this.tableUseClassReview.source.reset();
        await this.tableUseClassReview.source.load(this.useClassesSelected);
        this.tableCompositionsReview.source.reset();
        await this.tableCompositionsReview.source.load(this.compositions);
    }

    shufflePoints() {
        this.loadingPoints = true;
        this.points = this.points.sort(() => Math.random() - 0.5);
        this.tablePoints.source.empty();
        this.tablePoints.source.load(this.points);
        this.loadingPoints = false;
    }

    handlePointsFile(file) {
        const self = this;
        this.loadingPoints = true;
        const fileReader = new FileReader();
        fileReader.onload = async function (e) {
            self.points = self.csvToArray(fileReader.result);
            self.points = self.points.filter(function (item, i) {
                return (item.latitude !== null && item.longitude !== null && item.info !== null);
            });
            for (const [index, point] of self.points.entries()) {
                // const data = await self.campaignService.getPointInfo(point.latitude, point.longitude).toPromise();
                self.mapPoints.push([point.longitude, point.latitude]);
                // const location = data.results[0].locations[0];
                self.points[index].info = '';

            }
            await self.tablePoints.source.load(self.points);
            self.loadingPoints = false;
        };
        fileReader.readAsText(file);
    }

    csvToArray(csvString) {
        const lines = csvString.split('\n');
        const headerValues = lines[0].split(',');
        const dataValues = lines.splice(1).map(function (dataLine) {
            return dataLine.split(',');
        });
        return dataValues.map(function (rowValues) {
            const row = {};
            headerValues.forEach(function (headerValue, index) {
                row[headerValue] = (index < rowValues.length) ? rowValues[index] : null;
            });
            return row as Point;
        });
    }

    private filterCountries(value: string): Country[] {
        const filterValue = value.toLowerCase();
        if (this.countries) {
            return this.countries.filter(county => county.COUNTRY.toLowerCase().includes(filterValue));
        }
    }

    getFilteredCountries(value: string): Observable<Country[]> {
        return of(value).pipe(
            map(filterString => this.filterCountries(filterString)),
        );
    }

    onCountryChange() {
        this.filteredCountries$ = this.getFilteredCountries(this.country.nativeElement.value);
    }

    onSelectionCountryChange($event) {
        this.filteredCountries$ = this.getFilteredCountries($event);
    }

    selectThumb(thumb: any) {
        this.selectedThumb = thumb;
        this.isSingleView = true;
    }

    onSatelliteChange(satelliteId: number) {
        this.colorsComposition = this.satellitesColors.filter(color => color.id == satelliteId)
            .map(color => ({name: color.value.toUpperCase(), id: color.value}));
    }
}
