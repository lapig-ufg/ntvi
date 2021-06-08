import { Component, OnInit } from '@angular/core';
import { SatelliteService } from '../service/satellite.service';
import { Satellite} from '../model/satellite';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'ngx-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {

  id: number;
  satellite: Satellite;

  constructor(
    public organizationService: SatelliteService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['satelliteId'];

    this.organizationService.find(this.id).subscribe((data: Satellite) => {
      this.satellite = data;
    });
  }
  goTo(url) {
    this.router.navigateByUrl(url);
  }
}
