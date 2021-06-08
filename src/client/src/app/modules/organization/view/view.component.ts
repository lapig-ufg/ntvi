import { Component, OnInit } from '@angular/core';
import { OrganizationService } from '../service/organization.service';
import { Organization} from '../model/organization';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'ngx-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {

  id: number;
  organization: Organization;

  constructor(
    public organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['useClassId'];

    this.organizationService.find(this.id).subscribe((data: Organization) => {
      this.organization = data;
    });
  }
  goTo(url) {
    this.router.navigateByUrl(url);
  }
}
