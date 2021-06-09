import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { SatelliteService } from '../service/satellite.service';
import { Satellite } from '../model/satellite';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import {DialogComponent} from "../../../@theme/components";
import {TranslateService} from "@ngx-translate/core";
import {NbDialogService} from "@nebular/theme";

@Component({
  selector: 'ngx-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  @ViewChild('search') search: ElementRef;
  satellites: Satellite[] = [];
  settings = {
    mode: 'external',
    hideSubHeader: true,
    noDataMessage: this.translate.instant('tables_no_data_msg'),
    actions: {
      columnTitle: this.translate.instant('tables_actions'),
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
        width: '30%',
        title: this.translate.instant('satellite_index_table_column_name'),
      },
      description: {
        title: this.translate.instant('satellite_index_table_column_description'),
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();
  constructor(
    public satelliteService: SatelliteService,
    private router: Router,
    public translate: TranslateService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.getSatellites();
  }

  getSatellites(): void {
      this.satelliteService.getAll().subscribe((data: Satellite[]) => {
        this.satellites = data;
        this.source.load(this.satellites);
      });
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }

  deleteSatellite(id) {
    this.satelliteService.delete(id).subscribe(res => {
      this.satellites = this.satellites.filter(item => item.id !== id);
      this.source.load(this.satellites);
    });
  }

  onEdit(event) {
    this.goTo('/modules/satellite/' + event.data.id + '/edit');
  }

  onDeleteConfirm(event): void {
    const self = this;
    const data = {
      title: this.translate.instant('delete_msg_title'),
      msg: this.translate.instant('satellite_delete_msg', {name:event.data.name})
    }
    this.dialogService.open(DialogComponent, { context: data }).onClose.subscribe(function (confirmed) {
      if (confirmed) {
        self.deleteSatellite(event.data.id);
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
