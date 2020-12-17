import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign } from '../models/campaign';
import { Router } from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'ngx-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  infoForm: FormGroup;
  configForm: FormGroup;
  pointsForm: FormGroup;
  usersForm: FormGroup;
  imagesForm: FormGroup;

  constructor(
    public organizationService: CampaignService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.infoForm = this.fb.group({
      name: ['Name is required!', Validators.required],
      description: ['Description is required', Validators.required],
    });

    this.configForm = this.fb.group({
      secondCtrl: ['', Validators.required],
    });

    this.pointsForm = this.fb.group({
      thirdCtrl: ['', Validators.required],
    });

    this.usersForm = this.fb.group({
      thirdCtrl: ['', Validators.required],
    });

    this.imagesForm = this.fb.group({
      thirdCtrl: ['', Validators.required],
    });
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }


  // deleteClass(id) {
  //   this.organizationService.delete(id).subscribe(res => {
  //     this.classes = this.classes.filter(item => item.id !== id);
  //     this.source.load(this.classes);
  //   });
  // }
  //
  // onEdit(event) {
  //   this.goTo('/pages/organization/' + event.data.id + '/edit');
  // }
  //
  // onDeleteConfirm(event): void {
  //   if (window.confirm('Are you sure you want to delete?')) {
  //     this.deleteClass(event.data.id);
  //   }
  // }
  //
  // refresh() {
  //   this.search.nativeElement.value = '';
  //   this.source.reset();
  // }
  //
  // onSearch(query: string = '') {
  //   this.source.setFilter([
  //     {
  //       field: 'name',
  //       search: query,
  //     },
  //     {
  //       field: 'description',
  //       search: query,
  //     },
  //   ], false);
  // }
}
