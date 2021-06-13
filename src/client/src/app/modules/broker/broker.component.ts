import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'ngx-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss'],
})
export class BrokerComponent implements  AfterViewInit {
  url: string = ''
  height: number =  window.innerHeight - 250;
  ngAfterViewInit(): void {
    this.url = '/service/broker'
  }
}
