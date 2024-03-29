import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SatelliteService} from '../service/satellite.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ngx-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  form: FormGroup;

  constructor(
    public satelliteService: SatelliteService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', Validators.required),
    });
  }
  goTo(url) {
    this.router.navigateByUrl(url);
  }
  get f() {
    return this.form.controls;
  }

  submit() {
    this.satelliteService.create(this.form.value).subscribe(res => {
      this.router.navigateByUrl('/modules/satellite/index');
    });
  }
}
