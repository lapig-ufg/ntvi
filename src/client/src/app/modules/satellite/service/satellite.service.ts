import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Satellite } from '../model/satellite';

@Injectable({
  providedIn: 'root',
})
export class SatelliteService {

  private apiURL = '/service';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Satellite[]> {
    return this.httpClient.get<Satellite[]>(this.apiURL + '/satellites/')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  create(satellite): Observable<Satellite> {
    return this.httpClient.post<Satellite>(
      this.apiURL + '/satellites/',
      JSON.stringify(satellite),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  find(id): Observable<Satellite> {
    return this.httpClient.get<Satellite>(this.apiURL + '/satellites/' + id)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  update(id, satellite): Observable<Satellite> {
    return this.httpClient.put<Satellite>(
      this.apiURL + '/satellites/' + id,
      JSON.stringify(satellite),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  delete(id) {
    return this.httpClient.delete<Satellite>(this.apiURL + '/satellites/' + id, this.httpOptions)
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
