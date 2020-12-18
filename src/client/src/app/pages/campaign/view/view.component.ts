import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'ngx-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  compositions = [] as Composition[];
  organizations = [] as Organization[];
  usersOnCampaign = [] as UsersOnCampaigns[];
  useClassesSelected = [] as UseClass[];
  points = [] as Point[];
  images = [] as Image[];
  customImages = false as boolean;
  reviewCampaign = {} as any;
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
    public organizationService: CampaignService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // this.id = this.route.snapshot.params['useClassId'];
    //
    // this.organizationService.find(this.id).subscribe((data: Campaign) => {
    //   this.organization = data;
    // });
  }
  goTo(url) {
    this.router.navigateByUrl(url);
  }
}
