import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign } from '../models/campaign';
import { Router } from '@angular/router';
import {NbComponentStatus, NbSearchService, NbToastrService} from '@nebular/theme';
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
    public toastService: NbToastrService,
    private searchService: NbSearchService,
  ) { }

  ngOnInit(): void {
    const self = this;
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getCampaigns();
    this.searchService.onSearchInput()
      .subscribe((data: any) => {
        this.filterTerm = data.term;
      });
  }

  resetSearch() {
    this.filterTerm = '';
  }
  getCampaigns() {
    this.campaignService.getAllCampaignsFromUser(this.user.id).subscribe((data: Campaign[]) => {
      this.campaigns = data;
    });
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
    this.campaignService.startCampaignCache(campaign).subscribe((data: Campaign) => {
      this.showToast('success', 'Campaign image cache has started!', 'top-right');
    });
  }
  publishCampaign(campaign) {
    campaign.publish = !campaign.publish;
    const msg = campaign.publish ? 'Campaign ' + campaign.name + ' published!' : 'Campaign ' + campaign.name + ' is not publish!';
    this.campaignService.publishCampaign(campaign).subscribe((data: Campaign) => {
      this.showToast('success', msg, 'top-right');
    });
  }
  random(): number {
    return Math.random();
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    this.toastService.show(status, massage, { status, position, duration });
  }
}
