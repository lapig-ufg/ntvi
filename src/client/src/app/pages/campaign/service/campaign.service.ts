import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Campaign } from '../models/campaign';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {

  private apiURL = '/service';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Campaign[]> {
    return this.httpClient.get<Campaign[]>(this.apiURL + '/campaigns/')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getPointInfo(): Observable<Campaign[]> {
    return this.httpClient.get<Campaign[]>(this.apiURL + '/campaigns/')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  create(campaign): Observable<Campaign> {
    return this.httpClient.post<Campaign>(
      this.apiURL + '/campaign/create',
      JSON.stringify(campaign),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  createConfigForm(campaign): Observable<Campaign> {
    return this.httpClient.put<Campaign>(
      this.apiURL + '/campaign/createConfigForm/' + campaign.id,
      JSON.stringify(campaign),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  find(id): Observable<Campaign> {
    return this.httpClient.get<Campaign>(this.apiURL + '/campaigns/' + id)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  update(id, organization): Observable<Campaign> {
    return this.httpClient.put<Campaign>(
      this.apiURL + '/campaigns/' + id,
      JSON.stringify(organization),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  delete(id) {
    return this.httpClient.delete<Campaign>(this.apiURL + '/campaigns/' + id, this.httpOptions)
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
