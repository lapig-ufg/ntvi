import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {  Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Organization } from '../model/organization';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {

  private apiURL = '/service';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Organization[]> {
    return this.httpClient.get<Organization[]>(this.apiURL + '/organizations/')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  create(organization): Observable<Organization> {
    return this.httpClient.post<Organization>(
      this.apiURL + '/organizations/',
      JSON.stringify(organization),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  find(id): Observable<Organization> {
    return this.httpClient.get<Organization>(this.apiURL + '/organizations/' + id)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  update(id, organization): Observable<Organization> {
    return this.httpClient.put<Organization>(
      this.apiURL + '/organizations/' + id,
      JSON.stringify(organization),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  delete(id) {
    return this.httpClient.delete<Organization>(this.apiURL + '/organizations/' + id, this.httpOptions)
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
