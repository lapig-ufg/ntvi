import { Component, OnInit, AfterViewInit} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign} from '../models/campaign';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { Image } from '../models/image';
import { Organization } from '../../organization/model/organization';
import { Composition } from '../models/composition';
import { UsersOnCampaigns } from '../models/usersOnCampaigns';
import { UseClass } from '../../use-class/model/use-class';
import { Point } from '../models/point';
import { OrganizationService } from '../../organization/service/organization.service';

@Component({
  selector: 'ngx-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements AfterViewInit {
  id: number;
  campaign = {} as Campaign;
  organizations = [] as Organization[];
  customImages = false as boolean;
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
      actions: false,
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
    public route: ActivatedRoute,
    public router: Router,
    public organizationService: OrganizationService,
  ) { }

  ngAfterViewInit() {
    this.id = this.route.snapshot.params['campaignId'];
    this.organizationService.getAll().subscribe((data: Organization[]) => {
      this.organizations = data;
    });

    this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
      this.campaign = data;
      this.tablePoints.source.load(data.points);
      this.tableUseClass.source.load(data.classes);
      this.tableImages.source.load(data.images);
      this.tableUsers.source.load(data.UsersOnCampaigns);
      this.tableCompositionsReview.source.load(data.compositions);
    });

  }
}
