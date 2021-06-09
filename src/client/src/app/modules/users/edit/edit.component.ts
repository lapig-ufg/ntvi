import { Component, OnInit } from '@angular/core';
import { UsersService } from '../service/users.service';
import { User } from '../model/users';
import { Organization } from '../../organization/model/organization';
import { OrganizationService } from '../../organization/service/organization.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NbComponentStatus, NbThemeService, NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';

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
  themes = [];
  languages = [];
  selectedTheme: string;
  selectedLanguage: string;

  constructor(
    public usersService: UsersService,
    public organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    public toastService: NbToastrService,
    private themeService: NbThemeService,
    public translate: TranslateService) {
      this.themes = [
        {id: 'default', name : 'Default' },
        {id: 'cosmic', name : 'Cosmic' },
        {id: 'corporate', name : 'Corporate' },
        {id: 'dark', name : 'Dark' },
      ];
      this.languages = [
        {id: 'en', name : 'English' },
        {id: 'pt', name : 'Portuguese Brazil' },
      ];
    }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['userId'];
    this.usersService.find(this.id).subscribe((data: User) => {
      this.selectedItem = data.organization ? data.organization.id.toString() : null;
      this.selectedTheme = data.theme ? data.theme.toString() : null;
      this.selectedLanguage = data.language ? data.language.toString() : null;
      this.user = data;
    });

    this.organizationService.getAll().subscribe((data: Organization[]) => {
      this.organizations = data;
    });
  }

  checkPassword() {
    if (this.user.password !== this.confirmPassword) {
      this.showToast('danger', this.translate.instant('users_msg_repass'), 'top-right');
    }
  }

  saveChanges() {
    const self = this;
    this.user.organization = { id : parseInt(this.selectedItem, 0) };
    // this.user.typeUser = this.selectedTypeUser;
    if (this.user.password !== this.confirmPassword) {
      this.user.password = null;
    }

    this.user.language = this.selectedLanguage;
    this.user.theme = this.selectedTheme;
    localStorage.setItem('user', null);
    localStorage.setItem('user', JSON.stringify(this.user));

    this.usersService.update(this.id, this.user).subscribe((data: User) => {
      if(data){
        self.router.navigateByUrl('modules/users/admin');
        this.showToast('success', this.translate.instant('users_update'), 'top-right')
      } else {
        this.showToast('danger', this.translate.instant('users_error'), 'top-right')
      }
    });
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }

  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    setTimeout(() => this.toastService.show(status, massage, { status, position, duration }), 900);
  }
}
