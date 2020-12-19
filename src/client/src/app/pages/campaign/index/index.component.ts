import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign } from '../models/campaign';
import { Router } from '@angular/router';
import { NbSearchService } from '@nebular/theme';
import { User } from '../models/user';


@Component({
  selector: 'ngx-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  campaigns = [] as Campaign[];
  user: User;
  filterTerm: string;

  constructor(
    public campaignService: CampaignService,
    public router: Router,
    private searchService: NbSearchService,
  ) { }

  ngOnInit(): void {
    const self = this;
    this.user = JSON.parse(localStorage.getItem('user'));
    this.campaignService.getAllCampaignsFromUser(this.user.id).subscribe((data: Campaign[]) => {
      this.campaigns = data;
    });
    this.searchService.onSearchInput()
      .subscribe((data: any) => {
        this.filterTerm = data.term;
      });
  }

  resetSearch() {
    this.filterTerm = '';
  }
  canGenerateCache(campaign) {
    return (
      campaign.classes.length > 0 &&
      campaign.points.length > 0 &&
      campaign.compositions.length > 0 &&
      campaign.UsersOnCampaigns.length > 0
    );
  }
  startCache(campaign) {
    campaign.status = 'CACHING';
    this.campaignService.starCampaignCache(campaign).subscribe((data: Campaign) => {
    });
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
