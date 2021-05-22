import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
    @Input() messages: any;
    @Input() webSocket: any;
    @Input() mobile: any;

    @Input()  toggle!: boolean;
    @Output() toggleChange = new EventEmitter<boolean>();


    message: string = "";
    activeUser: string = "";

    constructor() { }

    ngOnInit(): void {
        this.activeUser = environment.activeUser;
    }

    toggler(){
        this.toggle = !this.toggle;
        this.toggleChange.emit(this.toggle);
    }

    sendMessage() {
        this.webSocket.send({type: "msg", msg: this.message });
        this.message = "";
    }
}
