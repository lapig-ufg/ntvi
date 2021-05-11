import { Component, OnInit } from '@angular/core';
import { UsersService } from '../service/users.service';
import { User } from '../model/users';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Organization } from '../../organization/model/organization';
import { OrganizationService } from '../../organization/service/organization.service';
import { NbComponentStatus, NbThemeService, NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  id: number;
  user = {} as User;
  organizations = [] as Organization[];
  themes = [];
  languages = [];
  selectedTheme: string;
  selectedLanguage: string;
  selectedItem: string;
  confirmPassword: string;
  constructor(
    public usersService: UsersService,
    public organizationService: OrganizationService,
    public route: ActivatedRoute,
    public router: Router,
    private themeService: NbThemeService,
    public translate: TranslateService,
    public toastService: NbToastrService ) {
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
    const user = JSON.parse(localStorage.getItem('user'));
    this.id = user.id;

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
      this.showToast('danger', 'Password divergents', 'top-right');
    }
  }

  saveChanges() {
    this.user.organization = { id : parseInt(this.selectedItem, 0) };
    if (this.user.password !== this.confirmPassword) {
      this.user.password = null;
    }
    this.user.language = this.selectedLanguage;
    this.user.theme = this.selectedTheme;
    this.usersService.update(this.id, this.user).subscribe((data: User) => {
      this.router.navigateByUrl('pages/campaign/index');
    });
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }
  showToast(status: NbComponentStatus, massage, position) {
    const duration = 4000;
    this.toastService.show(status, massage, { status, position, duration });
  }

  onChangeLang() {
    this.translate.use(this.selectedLanguage.match(/en|pt/) ? this.selectedLanguage : 'en');
  }

  onChangeTheme() {
    let theme = this.selectedTheme;
    if (theme === null || theme === undefined) {
      theme = 'default';
    }
    this.themeService.changeTheme(theme);
  }
}
