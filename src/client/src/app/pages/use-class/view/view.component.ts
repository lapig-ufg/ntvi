import { Component, OnInit } from '@angular/core';
import { UseClassService } from '../use-class.service';
import { UseClass} from '../use-class';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'ngx-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {

  id: number;
  useClass: UseClass;

  constructor(
    public useClassService: UseClassService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['useClassId'];

    this.useClassService.find(this.id).subscribe((data: UseClass) => {
      this.useClass = data;
    });
  }
  goTo(url) {
    this.router.navigateByUrl(url);
  }
}
