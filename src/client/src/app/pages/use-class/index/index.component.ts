import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { UseClassService } from '../use-class.service';
import { UseClass } from '../use-class';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  @ViewChild('search') search: ElementRef;
  classes: UseClass[] = [];
  settings = {
    mode: 'external',
    hideSubHeader: true,
    actions: {
      position: 'right',
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      name: {
        title: 'Name',
      },
      description: {
        title: 'Description',
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();
  constructor(
    public classService: UseClassService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.classService.getAll().subscribe((data: UseClass[]) => {
      this.classes = data;
      this.source.load(this.classes);
    });
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }

  deleteClass(id) {
    this.classService.delete(id).subscribe(res => {
      this.classes = this.classes.filter(item => item.id !== id);
    });
  }

  onEdit(event) {
    this.goTo('/pages/use-class/' + event.data.id + '/edit');
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.deleteClass(event.data.id);
      this.source.load(this.classes);
    }
  }

  refresh() {
    this.search.nativeElement.value = '';
    this.source.reset();
  }

  onSearch(query: string = '') {
    this.source.setFilter([
      {
        field: 'name',
        search: query,
      },
      {
        field: 'description',
        search: query,
      },
    ], false);
  }
}
