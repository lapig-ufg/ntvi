import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'ngx-campaign-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  users: any;
  constructor(
    private http: HttpClient,
  ) {
    this.http.get('/service/users').subscribe(result => {
      this.users = result;
    });
  }

  ngOnInit(): void {
  }

}
