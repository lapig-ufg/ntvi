import { Component, OnInit, AfterViewInit} from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign} from '../models/campaign';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { Organization } from '../../organization/model/organization';
import { OrganizationService } from '../../organization/service/organization.service';
import { TranslateService } from '@ngx-translate/core';

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
      noDataMessage: this.translate.instant('tables_no_data_msg'),
      actions: false,
      columns: {
        latitude: {
          title: this.translate.instant('campaign_view_points_table_col_lat'),
        },
        longitude: {
          title: this.translate.instant('campaign_view_points_table_col_lon'),
        },
        info: {
          title: this.translate.instant('campaign_view_points_table_col_location'),
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableUseClass = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
      noDataMessage: this.translate.instant('tables_no_data_msg'),
      actions: false,
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: false,
      },
      columns: {
        name: {
          title: this.translate.instant('campaign_view_use_classes_table_col_name'),
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableCompositionsReview = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
      noDataMessage: this.translate.instant('tables_no_data_msg'),
      actions: false,
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: false,
      },
      columns: {
        satellite: {
          title: this.translate.instant('campaign_view_colors_table_col_name'),
          valuePrepareFunction: (satellite) => {
            return satellite.name;
          },
        },
        colors: {
          title: this.translate.instant('campaign_view_colors_table_col_colors'),
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableUsers = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
      noDataMessage: this.translate.instant('tables_no_data_msg'),
      actions: false,
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: false,
      },
      columns: {
        user: {
          title: this.translate.instant('campaign_view_users_table_col_name'),
          valuePrepareFunction: (user) => {
            return user.name;
          },
        },
        typeUserInCampaign: {
          title: this.translate.instant('campaign_view_users_table_col_permission'),
        },
      },
    },
    source: new LocalDataSource(),
  };
  tableImages = {
    settings: {
      mode: 'external',
      hideSubHeader: true,
      noDataMessage: this.translate.instant('tables_no_data_msg'),
      actions: false,
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: false,
      },
      columns: {
        satellite: {
          title: this.translate.instant('campaign_view_images_table_col_name'),
          valuePrepareFunction: (satellite) => {
            return satellite.name;
          },
        },
        date: {
          title: this.translate.instant('campaign_view_images_table_col_date'),
        },
        url: {
          title: this.translate.instant('campaign_view_images_table_col_url'),
        },
      },
    },
    source: new LocalDataSource(),
  };
  loadingPoints = false as boolean;
  mapPoints = [] as any[];
  constructor(
    public campaignService: CampaignService,
    public route: ActivatedRoute,
    public router: Router,
    public translate: TranslateService,
    public organizationService: OrganizationService,
  ) { }

  ngAfterViewInit() {
    this.id = this.route.snapshot.params['campaignId'];
    this.organizationService.getAll().subscribe((data: Organization[]) => {
      this.organizations = data;
    });

    this.campaignService.getCampaignInfo(this.id).subscribe((data: Campaign) => {
      this.campaign = data;
      this.mapPoints = data.points.map(point => [parseFloat(point.longitude), parseFloat(point.latitude)]);
      this.tablePoints.source.load(data.points);
      this.tableUseClass.source.load(data.classes);
      this.tableImages.source.load(data.images);
      this.tableUsers.source.load(data.UsersOnCampaigns);
      this.tableCompositionsReview.source.load(data.compositions);

      this.loadingPoints = true;
      setTimeout(() =>  this.loadingPoints = false, 600);
    });

  }
  onMapReady(ev) {
    // console.log(ev)
  }
}
