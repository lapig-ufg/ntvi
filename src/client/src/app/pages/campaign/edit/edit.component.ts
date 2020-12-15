import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../service/campaign.service';
import { Campaign} from '../models/campaign';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  id: number;
  organization = {} as Campaign;
  form: FormGroup;

  constructor(
    public organizationService: CampaignService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['organizationId'];
    this.organizationService.find(this.id).subscribe((data: Campaign) => {
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
      this.router.navigateByUrl('pages/organization/index');
    });
  }

}
