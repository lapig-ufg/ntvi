import {Component, ElementRef, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign } from '../models/campaign';
import { Router } from '@angular/router';
import { NbComponentStatus, NbSearchService, NbToastrService } from '@nebular/theme';
import { User } from '../models/user';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'ngx-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements  AfterViewInit  {
  campaigns = [] as Campaign[];
  user: User;
  filterTerm: string;
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await null;
      return localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await null;
      return localStorage.getItem(key);
    },
  };
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
    public translate: TranslateService,
  ) { }

  ngAfterViewInit(): void {
    const self = this;
    this.asyncLocalStorage.getItem('user').then(function (value) {
      self.user = JSON.parse(value);
      self.getCampaigns();
      self.searchService.onSearchInput()
        .subscribe((data: any) => {
          self.filterTerm = data.term;
        });
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
      this.showToast('success', this.translate.instant('campaign_index_msg_cache'), 'top-right');
    });
  }

  removeCampaign(campaign) {
    this.campaignService.delete(campaign.id).subscribe((data: Campaign) => {
      this.showToast('success', this.translate.instant('campaign_index_msg_cache_removed', { name : campaign.name}), 'top-right');
    });
  }
  publishCampaign(campaign) {
    campaign.publish = !campaign.publish;
    const msg = campaign.publish ?
      this.translate.instant('campaign_index_msg_campaign_published', { name : campaign.name}) :
      this.translate.instant('campaign_index_msg_campaign_not_published', { name : campaign.name});
    this.campaignService.publishCampaign(campaign).subscribe((data: Campaign) => {
      this.showToast('success', msg, 'top-right');
    });
  }
  random(): number {
    return Math.random();
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    setTimeout(() => this.toastService.show(status, massage, { status, position, duration }), 900);
  }
  canInspect(campaign) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userOnCampaign = campaign.UsersOnCampaigns.find(user => user.userId === currentUser.id);
    return (
      campaign.status === 'READY' && userOnCampaign.typeUserInCampaign === 'INSPETOR'
    );
  }
  canRemove(campaign) {
    return (
      campaign.status !== 'READY' && campaign.status !== 'CACHING'
    );
  }
  canOpenResults(campaign) {
    let can = false;
    const currentUser = this.user;
    campaign.UsersOnCampaigns.forEach(function (item) {
      if (item.userId.toString() === currentUser.id.toString() && item.typeUserInCampaign === 'ADMIN') {
        can = true;
      }
    });
    return can;
  }
  beginInspection(campaign) {
    this.router.navigateByUrl('/modules/campaign/' + campaign.id + '/inspect');
  }
}
