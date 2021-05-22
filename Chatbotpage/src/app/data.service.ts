import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { Observable, timer, Subject, EMPTY, of } from 'rxjs';
import { retryWhen, tap, delayWhen, switchAll, catchError, filter, map, switchMap, delay } from 'rxjs/operators';
export const WS_ENDPOINT = environment.wsEndpoint;
export const RECONNECT_INTERVAL = environment.reconnectInterval;


@Injectable({
    providedIn: 'root'
})
export class DataService {

    constructor() {
    }
    connection$: WebSocketSubject<any> = null!;
    RETRY_SECONDS = 10; 
    connect(where: string): Observable<any> {
        return of('http://localhost:8181').pipe(
            filter(apiUrl => !!apiUrl),
            // https becomes wws, http becomes ws
            map(apiUrl => apiUrl.replace(/^http/, 'ws') + '/' + where),
            switchMap(wsUrl => {
                if (this.connection$) {
                    return this.connection$;
                } else {
                    // this.connection$ = webSocket(wsUrl);
                    this.connection$ = new WebSocketSubject({url: wsUrl, protocol: ["chat"]});
                    return this.connection$;
                }
            }),
            retryWhen((errors) => errors.pipe(delay(this.RETRY_SECONDS)))
        );
    }
    send(data: any) {
        if (this.connection$) {
            this.connection$.next(data);
        } else {
            console.error('Did not send data, open a connection first');
        }
    }
    closeConnection() {
        if (this.connection$) {
            this.connection$.complete();
            this.connection$ = null!;
        }
    }
    ngOnDestroy() {
        this.closeConnection();
    }
}
