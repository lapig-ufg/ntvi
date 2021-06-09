import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { OrganizationService } from '../../organization/service/organization.service';
import { SatelliteService } from '../../satellite/service/satellite.service';
import { CampaignService } from '../service/campaign.service';
import { UseClassService } from '../../use-class/service/use-class.service';
import { UserService } from '../service/user.service';

import { Satellite } from '../../satellite/model/satellite';
import { Composition } from '../models/composition';
import { Organization } from '../../organization/model/organization';
import { UseClass } from '../../use-class/model/use-class';
import { Point } from '../models/point';
import { User } from '../models/user';
import { UsersOnCampaigns } from '../models/usersOnCampaigns';
import { Image } from '../models/image';
import { LocalDataSource } from 'ng2-smart-table';
import { Campaign } from '../models/campaign';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
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
  campaign: Campaign;
  UsersOnCampaigns = [] as UsersOnCampaigns[];
  loadingPoints = false as boolean;
  customImages = false as boolean;
  reviewCampaign = {} as any;
  permissions = [
    { id: 'ADMIN', name: 'ADMIN' },
    { id: 'INSPETOR', name: 'INSPETOR' },
    { id: 'SUPERVISOR', name: 'SUPERVISOR' },
  ];
  colorsComposition = [
    { id: 'NIR', name: 'NIR' },
    { id: 'SWIR', name: 'SWIR' },
    { id: 'RED', name: 'RED' },
  ];
  tablePoints = {
    settings: {
      mode: 'external',
      noDataMessage: this.translate.instant('tables_no_data_msg'),
      hideSubHeader: true,
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
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: false,
      },
      columns: {
        user: {
          title:  this.translate.instant('campaign_view_users_table_col_name'),
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
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: false,
      },
      columns: {
        satellite: {
          title:  this.translate.instant('campaign_view_images_table_col_name'),
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
  constructor(
    public campaignService: CampaignService,
    public satelliteService: SatelliteService,
    public organizationService: OrganizationService,
    public useClassService: UseClassService,
    public userService: UserService,
    public toastService: NbToastrService,
    public router: Router,
    public fb: FormBuilder,
    public translate: TranslateService,
  ) { }

  ngOnInit(): void {
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
      this.users = data;
    });

    this.infoForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      organization: ['', Validators.required],
      numInspectors: ['', Validators.required],
    });

    this.configForm = this.fb.group({
      initialDate: ['', Validators.required],
      finalDate: ['', Validators.required],
      satellite: [],
      _colors: [],
      useClass: [],
    });

    this.pointsForm = this.fb.group({
      pointsFile: ['', Validators.required],
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
    if (!colors || colors.length < 3) {
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
      _colors: [],
    });
    this.tableCompositions.source.reset();
    await this.tableCompositions.source.load(this.compositions);
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

  // submit() {
  //   this.organizationService.create(this.form.value).subscribe(res => {
  //     this.router.navigateByUrl('/modules/organization/index');
  //   });
  // }

  onInfoFormSubmit() {
    this.infoForm.markAsDirty();
    const data: any = this.infoForm.value;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    data.permisson = { userId: currentUser.id, typeUserInCampaign: 'ADMIN'};
    this.campaignService.create(data).subscribe(res => {
      this.campaign = res;
    });
  }

  onConfigFormSubmit() {
    this.configForm.markAsDirty();

    this.campaign.initialDate = this.configForm.get('initialDate').value;
    this.campaign.finalDate = this.configForm.get('finalDate').value;

    const auxUseClasses = [];

    for (const ob of this.useClassesSelected) {
      auxUseClasses.push({ id: ob.id });
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

    this.campaignService.createConfigForm(this.campaign).subscribe(res => {
    });
  }
  onPointsFormSubmit() {
    this.pointsForm.markAsDirty();

    this.campaign.points = (this.points.length > 0 ? this.points : null);

    this.campaignService.createPointsForm(this.campaign).subscribe(res => {
    });
  }

  onUsersFormSubmit() {
    this.pointsForm.markAsDirty();

    this.campaign.UsersOnCampaigns = this.UsersOnCampaigns;

    this.campaignService.createUsersOnCampaignForm(this.campaign).subscribe(res => {
    });
    this.loadInputs();
  }

  onImagesFormSubmit() {
    this.imagesForm.markAsDirty();

    this.campaign.images = (this.images.length > 0 ? this.images : null);

    this.campaignService.createImagesForm(this.campaign).subscribe(res => {
    });
    this.loadInputs();
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    setTimeout(() => this.toastService.show(status, massage, { status, position, duration }), 900);
  }
  onMapReady(ev) {
    // console.log(ev)
  }

  async loadInputs() {
    this.reviewCampaign.name           = this.infoForm.get('name').value;
    this.reviewCampaign.description    = this.infoForm.get('description').value;
    this.reviewCampaign.organizationId = this.infoForm.get('organizationId').value;
    this.reviewCampaign.numInspectors  = this.infoForm.get('numInspectors').value;
    this.reviewCampaign.initialDate    = this.configForm.get('initialDate').value;
    this.reviewCampaign.finalDate      = this.configForm.get('finalDate').value;
    this.tableUseClassReview.source.reset();
    await this.tableUseClassReview.source.load(this.useClassesSelected);
    this.tableCompositionsReview.source.reset();
    await this.tableCompositionsReview.source.load(this.compositions);
  }
  shufflePoints() {
    // let ctr = this.points.length, temp, index;
    // // While there are elements in the array
    // while (ctr > 0) {
    //   // Pick a random index
    //   index = Math.floor(Math.random() * ctr);
    //   // Decrease ctr by 1
    //   ctr--;
    //   // And swap the last element with it
    //   temp = this.points[ctr];
    //   this.points[ctr] = this.points[index];
    //   this.points[index] = temp;
    //
    // }
    this.points = this.points.sort(() => Math.random() - 0.5);
    this.tablePoints.source.empty();
    this.tablePoints.source.load(this.points);
  }
  handlePointsFile(file) {
    const self = this;
    this.loadingPoints = true;
    const fileReader = new FileReader();
    fileReader.onload = async function (e) {
      self.points = self.csvToArray(fileReader.result);
      self.points = self.points.filter(function (item, i) {
        return (item.latitude !== null && item.longitude !== null);
      });
      for (const [index, point] of self.points.entries()) {
        const data = await self.campaignService.getPointInfo(point.latitude, point.longitude).toPromise();
        const location = data.results[0].locations[0];
        self.mapPoints.push([parseFloat(point.longitude), parseFloat(point.latitude)]);
        self.points[index].info = location.adminArea5 + ' - ' + location.adminArea3 + ' - ' + location.adminArea1;
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
}
