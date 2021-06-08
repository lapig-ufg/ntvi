import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../service/users.service';
import { User } from '../model/users';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';

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
      email: {
        title: 'E-mail',
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();
  constructor(
    public usersService: UsersService,
    private router: Router,
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

  deleteClass(id) {
    this.usersService.delete(id).subscribe(res => {
      this.users = this.users.filter(item => item.id !== id);
    });
  }

  onEdit(event) {
    this.goTo('/modules/users/' + event.data.id + '/edit');
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.deleteClass(event.data.id);
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
        field: 'email',
        search: query,
      },
    ], false);
  }

}
