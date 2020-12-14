import {AfterViewInit, Component} from '@angular/core';
import {NbMenuItem, NbMenuService} from '@nebular/theme';
import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements  AfterViewInit {
  constructor(private menuService: NbMenuService) {
  }

  menu = MENU_ITEMS;

  ngAfterViewInit(): void {
  }
}
