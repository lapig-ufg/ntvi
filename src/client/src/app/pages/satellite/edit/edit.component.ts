import { Component, OnInit } from '@angular/core';
import { SatelliteService } from '../service/satellite.service';
import { Satellite } from '../model/satellite';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  id: number;
  satellite = {} as Satellite;
  form: FormGroup;

  constructor(
    public satelliteService: SatelliteService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['satelliteId'];
    this.satelliteService.find(this.id).subscribe((data: Satellite) => {
      this.satellite = data;
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
    this.satelliteService.update(this.id, this.form.value).subscribe(res => {
      this.router.navigateByUrl('pages/satellite/index');
    });
  }

}
