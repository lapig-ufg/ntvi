import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign} from '../models/campaign';
import { ActivatedRoute, Router } from '@angular/router';
import {FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
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
  users = [] as User[];
  images = [] as Image[];
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
      hideSubHeader: true,
      actions: false,
      columns: {
        latitude: {
          title: 'Latitude',
        },
        longitude: {
          title: 'Longitude',
        },
        info: {
          title: 'Location',
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableUseClass = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
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
          title: 'Name',
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableCompositions = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
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
          title: 'Name',
          valuePrepareFunction: (satellite) => {
            return satellite.name;
          },
        },
        colors: {
          title: 'Colors',
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableUseClassReview = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
      actions: false,
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: false,
      },
      columns: {
        name: {
          title: 'Name',
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableCompositionsReview = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
      actions: false,
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: false,
      },
      columns: {
        satellite: {
          title: 'Name',
          valuePrepareFunction: (satellite) => {
            return satellite.name;
          },
        },
        colors: {
          title: 'Colors',
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableUsers = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
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
          title: 'Name',
          valuePrepareFunction: (user) => {
            return user.name;
          },
        },
        typeUserInCampaign: {
          title: 'Permission',
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableImages = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
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
          title: 'Name',
          valuePrepareFunction: (satellite) => {
            return satellite.name;
          },
        },
        date: {
          title: 'Date',
        },
        url: {
          title: 'URL',
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
    public route: ActivatedRoute,
    public fb: FormBuilder,
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

    this.loadFormInputs();
  }
  loadFormInputs() {
    this.id = this.route.snapshot.params['campaignId'];

    this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
      this.campaign = data;
      this.tablePoints.source.empty();
      this.tablePoints.source.load(data.points);
      this.tableUseClass.source.empty();
      this.tableUseClass.source.load(data.classes);
      this.tableImages.source.empty();
      this.tableImages.source.load(data.images);
      this.tableUsers.source.empty();
      this.tableUsers.source.load(data.UsersOnCampaigns);
      this.tableCompositions.source.empty();
      this.tableCompositions.source.load(data.compositions);
      this.infoForm.patchValue({
        name: data.name,
        description: data.description,
        organization: data.organizationId,
        numInspectors: data.numInspectors,
      });
      this.configForm.patchValue({
        initialDate: data.initialDate,
        finalDate: data.finalDate,
      });
    });
  }
  async addClass() {
    const useClassId = this.configForm.get('useClass').value;
    if (!useClassId) {
      this.showToast('danger', 'You need to choose a use class', 'top-right');
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
      this.showToast('danger', 'You need to choose a satellite', 'top-right');
      return;
    }
    if (!colors || colors.length < 3) {
      this.showToast('danger', 'You need to choose three colors', 'top-right');
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
      this.showToast('danger', 'You need to choose a user', 'top-right');
      return;
    }
    if (!permission) {
      this.showToast('danger', 'You need to choose three a permission', 'top-right');
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
      this.showToast('danger', 'You need to choose a satellite.', 'top-right');
      return;
    }
    if (!dataImg) {
      this.showToast('danger', 'You need to inform the date of the image.', 'top-right');
      return;
    }
    if (!url) {
      this.showToast('danger', 'You need to inform the url of the image.', 'top-right');
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
  onInfoFormSubmit() {
    // this.infoForm.markAsDirty();

    this.campaignService.create(this.infoForm.value).subscribe(res => {
      this.campaign = res;
    });

    const currentUser = JSON.parse(localStorage.getItem('user'));
    this.campaignService.getAllCampaignsFromUser(currentUser.id).subscribe(res => {
    });


  }
  onConfigFormSubmit() {
    // this.configForm.markAsDirty();

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
    // this.pointsForm.markAsDirty();

    this.campaign.points = (this.points.length > 0 ? this.points : null);

    this.campaignService.createPointsForm(this.campaign).subscribe(res => {
    });
  }
  onUsersFormSubmit() {
    // this.pointsForm.markAsDirty();

    this.campaign.UsersOnCampaigns = this.UsersOnCampaigns;

    this.campaignService.createUsersOnCampaignForm(this.campaign).subscribe(res => {
    });
    this.loadInputs();
  }
  onImagesFormSubmit() {
    // this.imagesForm.markAsDirty();

    this.campaign.images = (this.images.length > 0 ? this.images : null);

    this.campaignService.createImagesForm(this.campaign).subscribe(res => {
    });
    this.loadInputs();
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    this.toastService.show(status, massage, { status, position, duration });
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
    let ctr = this.points.length, temp, index;
    // While there are elements in the array
    while (ctr > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * ctr);
      // Decrease ctr by 1
      ctr--;
      // And swap the last element with it
      temp = this.points[ctr];
      this.points[ctr] = this.points[index];
      this.points[index] = temp;
      this.tablePoints.source.empty();
      this.tablePoints.source.load(this.points);
    }
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
        const data = await self.campaignService.getPointInfo(point.latitude, point.longitude).toPromise();
        const location = data.results[0].locations[0];
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
