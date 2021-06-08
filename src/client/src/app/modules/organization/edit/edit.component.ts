import { Component, OnInit } from '@angular/core';
import { OrganizationService } from '../service/organization.service';
import { Organization} from '../model/organization';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  id: number;
  organization = {} as Organization;
  form: FormGroup;

  constructor(
    public organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['organizationId'];
    this.organizationService.find(this.id).subscribe((data: Organization) => {
      this.organization = data;
    });

    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', Validators.required),
    });
  }

  get f() {
    return this.form.controls;
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }

  submit() {
    this.organizationService.update(this.id, this.form.value).subscribe(res => {
      this.router.navigateByUrl('modules/organization/index');
    });
  }

}
