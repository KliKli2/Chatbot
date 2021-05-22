import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-participants',
    templateUrl: './participants.component.html',
    styleUrls: ['./participants.component.css']
})
export class ParticipantsComponent implements OnInit {
    @Input() participants: any;
    @Input() mobile: any;
    @Input()  toggle!: boolean;
    @Output() toggleChange = new EventEmitter<boolean>();

    constructor() { }

    ngOnInit(): void {
    }
    toggler(){
        this.toggle = !this.toggle;
        this.toggleChange.emit(this.toggle);
    }

}
