import { Component, EventEmitter, Input, Output, AfterViewChecked, ElementRef, ViewChild, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
	// @ViewChild('scrollMe') private myScrollContainer: ElementRef;
	@Input() messages: any;
	@Input() webSocket: any;
	@Input() mobile: any;

	@Input()  toggle!: boolean;
	@Output() toggleChange = new EventEmitter<boolean>();


	sights: any;
	message: string = "";
	activeUser: string = "";

	constructor() { }

	// ngAfterViewChecked() {        
	// 	this.scrollToBottom();        
	// } 

	// scrollToBottom(): void {
	// 	try {
	// 		this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
	// 	} catch(err) { }                 
	// }
	ngOnInit(): void {
		this.activeUser = environment.activeUser;
		// this.scrollToBottom();
	}

	processList(msg: any){
		let idx = 0;
		let pos = 0;
		let scores = new Map<number, string>();
		while(msg.indexOf("+", pos) != -1 && pos < msg.length){
			pos = msg.indexOf("+", pos)+1
			if(msg.indexOf("+", pos) != -1){
				scores.set(idx, msg.substring(pos, msg.indexOf("+", pos)));
				idx += 1;
			}
		}
		return scores;
	}

	// |
	// ~Schiefer Turm von Pisa~
	// #Kaum... tragen.#
	// $18€, keine Ermäßigung für Kinder$
	// @täglich 10-18 Uhr@
	// |
	processMsg(msg: any){
		let pos = 0;
		let ret = []
		while(msg.indexOf("|", pos) != -1 && pos < msg.length){
			let scores = new Map<string, string>();
			let start0 = msg.indexOf("|", pos)
			let start1 = msg.indexOf("~", pos)
			let start2 = msg.indexOf("#", pos)
			let start3 = msg.indexOf("$", pos)
			let start4 = msg.indexOf("@", pos)
			if(start0 == -1 || start1 == -1 || start2 == -1 || start3 == -1 || start4 == -1){
				break;
			}
			let end0 = msg.indexOf("|", start0+1)
			let end1 = msg.indexOf("~", start1+1)
			let end2 = msg.indexOf("#", start2+1)
			let end3 = msg.indexOf("$", start3+1)
			let end4 = msg.indexOf("@", start4+1)
			scores.set("name", msg.substring(start1+1, end1));
			scores.set("description", msg.substring(start2+1, end2));
			scores.set("price", msg.substring(start3+1, end3));
			scores.set("time", msg.substring(start4+1, end4));
			if(end0 == -1 || end0 == msg.length){
				this.sights = scores;
				console.log(scores)
				ret.push(scores)
				break;
			}else{
				pos = end0;
				this.sights = scores;
				console.log(scores)
				ret.push(scores)
			}
		}
		console.log(ret)
		return ret
	}

	getElFromMap(map: any, key: string){
		return map.get(key)
	}

	getTime(){
		return new Date().toLocaleString();
	}

	toggler(){
		this.toggle = !this.toggle;
		this.toggleChange.emit(this.toggle);
	}

	sendMessage() {
		if(this.message != ""){
			this.webSocket.send({type: "msg", msg: this.message });
			this.message = "";
		}
	}
}
