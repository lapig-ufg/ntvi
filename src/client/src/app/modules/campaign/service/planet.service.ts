import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PlanetService {

    private apiURL = '/service';

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    constructor(private httpClient: HttpClient) {
    }

    getMosaics(): Observable<any[]> {
        return this.httpClient.get<any[]>(
            this.apiURL + '/planet/mosaics').pipe(
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
