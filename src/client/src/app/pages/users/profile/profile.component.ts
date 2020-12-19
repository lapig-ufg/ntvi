import { Component, OnInit } from '@angular/core';
import { UsersService } from '../service/users.service';
import { User } from '../model/users';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Organization } from '../../organization/model/organization';
import { OrganizationService } from '../../organization/service/organization.service';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  id: number;
  user = {} as User;
  organizations = [] as Organization[];
  selectedItem: string;

  constructor(
    public usersService: UsersService,
    public organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    ) {
    }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user'));
    this.id = user.id;

    this.usersService.find(this.id).subscribe((data: User) => {
      this.selectedItem = data.organization.id.toString();
      this.user = data;
    });

    this.organizationService.getAll().subscribe((data: Organization[]) => {
      this.organizations = data;
    });
  }

  saveChanges() {
    this.usersService.update(this.id, this.user).subscribe((data: User) => {
      this.router.navigateByUrl('pages/campaign/index');
    });
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }

}
