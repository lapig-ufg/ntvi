import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { UseClassService } from '../service/use-class.service';
import { UseClass } from '../model/use-class';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';
import {DialogComponent} from "../../../@theme/components";

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
    noDataMessage: this.translate.instant('tables_no_data_msg'),
    actions: {
      position: 'right',
      columnTitle: this.translate.instant('tables_actions'),
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
        width: '20%',
        title: this.translate.instant('use_class_index_table_column_name'),
      },
      description: {
        title: this.translate.instant('use_class_index_table_column_description'),
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();
  constructor(
    public classService: UseClassService,
    private router: Router,
    public translate: TranslateService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.classService.getAll().subscribe((data: UseClass[]) => {
      this.classes = data.sort((a, b) => (a.name > b.name) ? 1 : -1)
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
    this.goTo('/modules/use-class/' + event.data.id + '/edit');
  }

  onDeleteConfirm(event): void {
    const self = this;
    const data = {
      title: this.translate.instant('delete_msg_title'),
      msg: this.translate.instant('use_class_delete_msg', {name:event.data.name})
    }
    this.dialogService.open(DialogComponent, { context: data}).onClose.subscribe(function (confirmed) {
      if (confirmed) {
        self.deleteClass(event.data.id);
        self.source.load(self.classes);
      }
    });
  }

  refresh() {
    this.search.nativeElement.value = '';
    this.source.reset();
  }

  onSearch(query: string = '') {
    if(query != ''){
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
}
