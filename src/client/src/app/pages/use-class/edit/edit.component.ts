import { Component, OnInit } from '@angular/core';
import { UseClassService } from '../use-class.service';
import { UseClass} from '../use-class';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'ngx-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  id: number;
  useClass = {} as UseClass;
  form: FormGroup;

  constructor(
    public useClassService: UseClassService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['useClassId'];
    this.useClassService.find(this.id).subscribe((data: UseClass) => {
      this.useClass = data;
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
    this.useClassService.update(this.id, this.form.value).subscribe(res => {
      this.router.navigateByUrl('pages/use-class/index');
    });
  }

}
