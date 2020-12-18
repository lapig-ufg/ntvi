import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { requiredFileType } from '../../../validators/upload-file-validators';
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
import { Campaign } from '../models/campaign';
import { observable } from 'rxjs';


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
  users = [] as User[];
  images = [] as Image[];
  campaign: Campaign;

  permissions = [
    { id: 'ADMIN', name: 'ADMIN' },
    { id: 'INSPETOR', name: 'INSPETOR' },
    { id: 'SUPERVISOR', name: 'SUPERVISOR' },
  ];
  usersOnCampaign = [] as UsersOnCampaigns[];
  colorsComposition = [
    { id: 'NIR', name: 'NIR' },
    { id: 'SWIR', name: 'SWIR' },
    { id: 'RED', name: 'RED' },
  ];
  constructor(
    public campaignService: CampaignService,
    public satelliteService: SatelliteService,
    public organizationService: OrganizationService,
    public useClassService: UseClassService,
    public userService: UserService,
    private toastService: NbToastrService,
    private router: Router,
    private fb: FormBuilder,
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
      organizationId: ['', Validators.required],
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
  addClass() {
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
  }
  addComposition() {
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
      // satelliteId: satelliteId,
      satellite: satellite,
    };
    this.compositions.push(composition);
    this.configForm.patchValue({
      satellite: '',
      _colors: [],
    });
  }
  addUserOnCampaign() {
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
    this.usersOnCampaign.push(userOnCampaign);
    this.usersForm.patchValue({
      user: '',
      permission: '',
    });
  }
  addImage() {
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
  }

  removeComposition(index) {
    this.compositions = this.compositions.filter(function (item, i) {
      return i !== index;
    });
  }

  removeClass(index) {
    this.useClasses = this.useClasses.filter(function (item, i) {
      return i !== index;
    });
  }

  removeUserOnCampaign(index) {
    this.usersOnCampaign = this.usersOnCampaign.filter(function (item, i) {
      return i !== index;
    });
  }

  removeImage(index) {
    this.images = this.images.filter(function (item, i) {
      return i !== index;
    });
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
  //     this.router.navigateByUrl('/pages/organization/index');
  //   });
  // }

  onInfoFormSubmit() {
    this.infoForm.markAsDirty();
    // console.log(this.infoForm.value);

    this.campaignService.create(this.infoForm.value).subscribe(res => {
      this.campaign = res;
    });
  }
  onConfigFormSubmit() {
    this.configForm.markAsDirty();

    this.campaign.initialDate = this.configForm.get('initialDate').value;
    this.campaign.finalDate = this.configForm.get('finalDate').value;

    let auxUseClasses = []

    for (let ob of this.useClassesSelected) {
      auxUseClasses.push({ id: ob.id })
    }

    let auxCompositions = []

    for (let ob of this.compositions) {
      auxCompositions.push({
        satellite: ob.satellite.id,
        colors: ob.colors
      })
    }

    this.campaign.compositions = auxCompositions;
    this.campaign.classes = auxUseClasses;

    this.campaignService.createConfigForm(this.campaign).subscribe(res => {
    });


  }
  onPointsFormSubmit() {
    this.pointsForm.markAsDirty();
  }
  onUsersFormSubmit() {
    this.pointsForm.markAsDirty();
  }
  onImagesFormSubmit() {
    this.imagesForm.markAsDirty();
  }
  showToast(status: NbComponentStatus, massage, position) {
    this.toastService.show(status, massage, { status, position });
  }
  onMapReady(ev) {
    // console.log(ev)
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
    }
  }
  handlePointsFile(file) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.points = this.csvToArray(fileReader.result);
      this.points = this.points.filter(function (item, i) {
        return (item.latitude !== null && item.longitude !== null && item.info !== null);
      });
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
