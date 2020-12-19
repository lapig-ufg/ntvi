import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { User } from '../model/users';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiURL = '/service';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.apiURL + '/users/')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  find(id): Observable<User> {
    console.log('id::', id)
    return this.httpClient.get<User>(this.apiURL + '/user/' + id)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  update(id, user): Observable<User> {
    return this.httpClient.put<User>(
      this.apiURL + '/user/' + id,
      JSON.stringify(user),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  delete(id) {
    return this.httpClient.delete<User>(this.apiURL + '/user/' + id, this.httpOptions)
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
