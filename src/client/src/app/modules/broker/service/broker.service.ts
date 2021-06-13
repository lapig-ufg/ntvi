import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class BrokerService {

  private apiURL = '/service';

  httpOptions: any

  constructor(private httpClient: HttpClient) {
    const token = localStorage.getItem('token');
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        token: `${token}`,
      }),
    };
  }

  get(): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/broker',  this.httpOptions)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
