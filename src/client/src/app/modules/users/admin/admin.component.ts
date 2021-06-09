import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../service/users.service';
import { User } from '../model/users';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import {TranslateService} from "@ngx-translate/core";
import {NbDialogService} from "@nebular/theme";
import {DialogComponent} from "../../../@theme/components";

@Component({
  selector: 'ngx-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {

  @ViewChild('search') search: ElementRef;
  users: User[] = [];
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
        title: this.translate.instant('users_admin_table_column_name'),
      },
      email: {
        title: this.translate.instant('users_admin_table_column_email'),
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();
  constructor(
    public usersService: UsersService,
    private router: Router,
    public translate: TranslateService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
      this.usersService.getAll().subscribe((data: User[]) => {
        this.users = data;
        this.source.load(this.users);
      });
  }

  goTo(url) {
    this.router.navigateByUrl(url);
  }

  deleteUser(id) {
    this.usersService.delete(id).subscribe(res => {
      this.users = this.users.filter(item => item.id !== id);
      this.source.load(this.users);
    });
  }

  onEdit(event) {
    this.goTo('/modules/users/' + event.data.id + '/edit');
  }

  onDeleteConfirm(event): void {
    const self = this;
    const data = {
      title: this.translate.instant('delete_msg_title'),
      msg: this.translate.instant('users_admin_delete_msg', {name:event.data.name})
    }
    this.dialogService.open(DialogComponent, { context: data}).onClose.subscribe(function (confirmed) {
      if (confirmed) {
        self.deleteUser(event.data.id);
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
