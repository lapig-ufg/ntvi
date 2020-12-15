import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UseClass } from '../model/use-class';

@Injectable({
  providedIn: 'root',
})
export class UseClassService {

  private apiURL = '/service';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<UseClass[]> {
    return this.httpClient.get<UseClass[]>(this.apiURL + '/classes/')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  create(useClass): Observable<UseClass> {
    return this.httpClient.post<UseClass>(this.apiURL + '/classes/', JSON.stringify(useClass), this.httpOptions)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  find(id): Observable<UseClass> {
    return this.httpClient.get<UseClass>(this.apiURL + '/classes/' + id)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  update(id, useClass): Observable<UseClass> {
    return this.httpClient.put<UseClass>(this.apiURL + '/classes/' + id, JSON.stringify(useClass), this.httpOptions)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  delete(id) {
    return this.httpClient.delete<UseClass>(this.apiURL + '/classes/' + id, this.httpOptions)
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
