import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PointService {

  private apiURL = '/service';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) { }

  login(access): Observable<any> {
    return this.httpClient.post<any>(
      this.apiURL + '/login',
      JSON.stringify(access),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }
  getNextPoint(form): Observable<any> {
    return this.httpClient.post<any>(
      this.apiURL + '/points/next-point',
      JSON.stringify(form),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }
  getPoint(): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/points/next-point')
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getPointResult(params): Observable<any> {
    return this.httpClient.post<any>(this.apiURL + '/points/get-point',
      JSON.stringify(params),
      this.httpOptions)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getLandUses(): Observable<any[]> {
    return this.httpClient.get<any[]>(
      this.apiURL + '/points/landUses',
      this.httpOptions,
    ).pipe(
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
