import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Location } from '../models/location';
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

  getPointInfo(lat, lng): Observable<Location> {
    const url = 'https://www.mapquestapi.com/geocoding/v1/reverse?key=bBVooFBpN6TcczLfcG0MVLyk7HDhgdxq&location='
      + lat + '%2C' + lng + '&outFormat=json&thumbMaps=false';
    return this.httpClient.get<Location>(url)
      .pipe(
        catchError(this.errorHandler),
      );
  }

  getAllCampaignsFromUser(userId): Observable<Campaign[]> {
    return this.httpClient.get<Campaign[]>(
      this.apiURL + '/campaign/campaignsFromUser/' + userId,
      this.httpOptions,
    ).pipe(
      catchError(this.errorHandler),
    );
  }

  getCampaignInfo(campaignId): Observable<Campaign> {
    return this.httpClient.get<Campaign>(
      this.apiURL + '/campaign/info/' + campaignId).pipe(
        catchError(this.errorHandler),
      );
  }

  startCampaignCache(campaign): Observable<Campaign> {
    return this.httpClient.put<Campaign>(
      this.apiURL + '/campaign/startCampaignCache/' + campaign.id,
      JSON.stringify(campaign),
      this.httpOptions,
    ).pipe(
      catchError(this.errorHandler),
    );
  }
  publishCampaign(campaign): Observable<Campaign> {
    return this.httpClient.put<Campaign>(
      this.apiURL + '/campaign/publishCampaign/' + campaign.id,
      JSON.stringify(campaign),
      this.httpOptions,
    ).pipe(
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

  createPointsForm(campaign): Observable<Campaign> {
    return this.httpClient.put<Campaign>(
      this.apiURL + '/campaign/createPointsForm/' + campaign.id,
      JSON.stringify(campaign),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  createUsersOnCampaignForm(campaign): Observable<Campaign> {
    return this.httpClient.put<Campaign>(
      this.apiURL + '/campaign/createUsersCampaignForm/' + campaign.id,
      JSON.stringify(campaign),
      this.httpOptions,
    )
      .pipe(
        catchError(this.errorHandler),
      );
  }

  createImagesForm(campaign): Observable<Campaign> {
    return this.httpClient.put<Campaign>(
      this.apiURL + '/campaign/createImagesForm/' + campaign.id,
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
  findCampaignsByUser(id): Observable<Campaign> {
    return this.httpClient.get<Campaign>(this.apiURL + '/campaign/getAllCampaignsByUser/' + id)
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

  returnNDVISeries(long, lat): Observable<any> {
    return this.httpClient.get<any>(
      this.apiURL + '/campaign/dashboard/modis?long=' + long + "&lat=" + lat).pipe(
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
