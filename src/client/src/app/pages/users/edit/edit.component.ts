import { Component, OnInit } from '@angular/core';
import { UsersService } from '../service/users.service';
import { User } from '../model/users';
import { Organization } from '../../organization/model/organization';
import { OrganizationService } from '../../organization/service/organization.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  id: number;
  user = {} as User;
  organizations = [] as Organization[];
  form: FormGroup;
  selectedItem: string;
  selectedTypeUser: string;
  confirmPassword: string;

  constructor(
    public usersService: UsersService,
    public organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    public toastService: NbToastrService,
    ) {
    }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['userId'];
    this.usersService.find(this.id).subscribe((data: User) => {
      this.user = data;
    });

    const user = JSON.parse(localStorage.getItem('user'));
    this.id = user.id;

    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', Validators.required),
    });

    this.usersService.find(this.id).subscribe((data: User) => {
      this.selectedItem = data.organization ? data.organization.id.toString() : null;
      // this.selectedTypeUser = data.typeUser;
      this.user = data;
    });

    this.organizationService.getAll().subscribe((data: Organization[]) => {
      this.organizations = data;
    });
  }

  checkPassword() {
    if (this.user.password !== this.confirmPassword) {
      this.showToast('danger', 'Password divergents', 'top-right');
    }
  }

  saveChanges() {
    this.user.organization = { id : parseInt(this.selectedItem, 0) };
    // this.user.typeUser = this.selectedTypeUser;
    if (this.user.password !== this.confirmPassword) {
      this.user.password = null;
    }
    this.usersService.update(this.id, this.user).subscribe((data: User) => {
      this.router.navigateByUrl('pages/users/admin');
    });
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }

  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    this.toastService.show(status, massage, { status, position, duration });
  }

}
