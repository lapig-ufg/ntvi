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
  getPoint(): Observable<any> {
    return this.httpClient.get<any>(this.apiURL + '/points/next-point')
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
