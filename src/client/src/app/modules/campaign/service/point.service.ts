import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

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

    point(pointId): Observable<any> {
        return this.httpClient.get<any>(
            this.apiURL + '/point/' + pointId).pipe(
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
    saveInspections(pointId: number, inspections: any[]): Observable<any> {
        const body = { pointId, inspections };
        return this.httpClient.post<any>(
            `${this.apiURL}/points/save-inspections`,
            JSON.stringify(body),
            this.httpOptions,
        ).pipe(
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

    errorHandler(error: any) {
        let mensagemDeErro = '';

        // Tratamento de erros do lado do cliente ou erros de rede
        if (error.error instanceof ErrorEvent) {
            mensagemDeErro = `Erro no cliente: ${error.error.message}`;
        } else {
            mensagemDeErro = `Código do erro: ${error.status}\nMensagem: ${error.message || 'Ocorreu um erro inesperado'}`;

            // Verifica códigos HTTP específicos e personaliza a mensagem
            switch (error.status) {
                case 400:
                    mensagemDeErro = `Requisição inválida: ${error.message}`;
                    break;
                case 401:
                    mensagemDeErro = `Não autorizado: Verifique suas credenciais.`;
                    break;
                case 403:
                    mensagemDeErro = `Proibido: Você não tem permissão para realizar esta ação.`;
                    break;
                case 404:
                    mensagemDeErro = `Não encontrado: ${error.error.message}`;
                    break;
                case 500:
                    mensagemDeErro = `Erro interno no servidor: Tente novamente mais tarde.`;
                    break;
                default:
                    mensagemDeErro = `Código do erro: ${error.status}\nMensagem: ${error.message || 'Ocorreu um erro desconhecido'}`;
            }
        }
        return throwError(mensagemDeErro);
    }
}
