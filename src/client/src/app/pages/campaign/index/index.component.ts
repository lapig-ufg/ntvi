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
  itemsActions = [
    { title: 'EDIT' },
    { title: 'INSPECT' },
    { title: 'PUBLISH' },
    { title: 'REMOVE' },
    { title: 'START CHACHE' },
  ];

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
  handlePoints(campaign) {
    const points = [];
    for (const [index, point] of campaign.points.entries()) {
      points.push([parseFloat(point.longitude), parseFloat(point.latitude)]);
    }
    return points;
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
  removeCampaign(campaign) {
    this.campaignService.delete(campaign.id).subscribe((data: Campaign) => {
      this.showToast('success', 'Campaign ' + campaign.name + ' was removed!', 'top-right');
    });
  }
  publishCampaign(campaign) {
    campaign.publish = !campaign.publish;
    const msg = campaign.publish ? 'Campaign ' + campaign.name + ' published!' : 'Campaign ' + campaign.name + ' was not publish!';
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
  canInspect(campaign) {
    return (
      campaign.status === 'READY'
    );
  }
  canRemove(campaign) {
    return (
      campaign.status !== 'READY' && campaign.status !== 'CACHING'
    );
  }
  canOpenResults(campaign) {
    let can = false;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    campaign.UsersOnCampaigns.forEach(function (item) {
      if (item.userId.toString() === currentUser.id.toString() && item.typeUserInCampaign === 'ADMIN') {
        can = true;
      }
    });
    return can;
  }
  beginInspection(campaign) {
    this.router.navigateByUrl('/pages/campaign/' + campaign.id + '/inspect');
  }
}
