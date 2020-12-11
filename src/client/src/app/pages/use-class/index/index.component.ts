import { Component, OnInit } from '@angular/core';
import { UseClassService } from '../use-class.service';
import { UseClass } from '../use-class';

@Component({
  selector: 'ngx-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  classes: UseClass[] = [];
  constructor(public classService: UseClassService) { }

  ngOnInit(): void {
    this.classService.getAll().subscribe((data: UseClass[]) => {
      this.classes = data;
    });
  }
  deleteClass(id) {
    this.classService.delete(id).subscribe(res => {
      this.classes = this.classes.filter(item => item.id !== id);
    });
  }

}
