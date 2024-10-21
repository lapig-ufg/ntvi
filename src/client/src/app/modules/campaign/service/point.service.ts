import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Campaign} from "../models/campaign";

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

    constructor(private httpClient: HttpClient) {
    }

    getPoints(campaignId): Observable<any[]> {
        return this.httpClient.get<any[]>(
            this.apiURL + '/points/info/' + campaignId).pipe(
            catchError(this.errorHandler),
        );
    }

    getCampaign(campaignId): Observable<any> {
        return this.httpClient.get<any>(
            this.apiURL + '/points/camp/' + campaignId).pipe(
            catchError(this.errorHandler),
        );
    }

    point(campaignId, pointId): Observable<any> {
        return this.httpClient.get<any>(
            this.apiURL + '/points/' + campaignId + '/' + pointId).pipe(
            catchError(this.errorHandler),
        );
    }


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
            this.apiURL + '/points/update-point',
            JSON.stringify(form),
            this.httpOptions,
        )
            .pipe(
                catchError(this.errorHandler),
            );
    }

    getPoint(ob: any): Observable<any> {
        return this.httpClient.post<any>(this.apiURL + '/points/next-point', ob)
            .pipe(
                catchError(this.errorHandler),
            );
    }
    getPointToInpection(campaignId: number, interpreterId: number): Observable<any> {
        return this.httpClient.get<any>(`${this.apiURL}/point-inspection/${campaignId}/${interpreterId}`)
            .pipe(
                catchError(this.errorHandler),
            );
    }

    getPointResult(params): Observable<any> {
        return this.httpClient.post<any>(this.apiURL + '/points/results',
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

    updateSingleClassConsolidated(params): Observable<any> {
        return this.httpClient.post<any>(this.apiURL + '/points/updateSingleClassConsolidated',
            JSON.stringify(params),
            this.httpOptions)
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
