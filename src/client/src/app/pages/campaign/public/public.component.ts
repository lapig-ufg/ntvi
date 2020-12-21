import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign } from '../models/campaign';
import { Router } from '@angular/router';
import {NbComponentStatus, NbSearchService, NbToastrService} from '@nebular/theme';
import { User } from '../models/user';


@Component({
  selector: 'ngx-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss'],
})
export class PublicComponent implements OnInit {
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
    this.campaignService.getAllPublicCampaigns().subscribe((data: Campaign[]) => {
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
  random(): number {
    return Math.random();
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    this.toastService.show(status, massage, { status, position, duration });
  }
}
