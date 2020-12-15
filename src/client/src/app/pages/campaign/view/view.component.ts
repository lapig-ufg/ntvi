import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign} from '../models/campaign';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'ngx-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {

  id: number;
  organization: Campaign;

  constructor(
    public organizationService: CampaignService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['useClassId'];

    this.organizationService.find(this.id).subscribe((data: Campaign) => {
      this.organization = data;
    });
  }
  goTo(url) {
    this.router.navigateByUrl(url);
  }
}
