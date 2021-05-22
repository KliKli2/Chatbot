import {Message} from '@angular/compiler/src/i18n/i18n_ast';
import { Component } from '@angular/core';
import {FormControl} from '@angular/forms';
import * as $ from 'jquery';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {DataService} from './data.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    messages: Message[] = [];
    participants: Message[] = [];
    tog: boolean = false;
    mobile: boolean = false;
    msgCtrl = "";
    destroyed$ = new Subject();
    constructor(public webSocket: DataService) {}
    ngOnInit() {
        if (window.screen.width < 360) { // 768px portrait
            this.mobile = true;
        }
        this.webSocket.connect("").pipe(
            takeUntil(this.destroyed$)
        ).subscribe(messages => {
            switch(messages.type){
                case "msg":
                    this.messages.push(messages)
                break;
                case "join":
                    this.participants.push(messages)
                break;
            }
        });
        environment.activeUser = "Client" + Math.floor(Math.random()*100);
        this.webSocket.send({type: "join", name: environment.activeUser });
    }
    sendMessage() {
        this.webSocket.send({type: "msg", msg: this.msgCtrl });
    }
    ngOnDestroy() {
        this.destroyed$.next();
    }
}
