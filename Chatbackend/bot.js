'use strict'

var WebSocketClient = require('websocket').client

/**
 * bot ist ein einfacher Websocket Chat Client
 */

class bot {

	/**
	 * Konstruktor baut den client auf. Er erstellt einen Websocket und verbindet sich zum Server
	 * Bitte beachten Sie, dass die Server IP hardcodiert ist. Sie müssen sie umsetzten
	 */
	constructor () {
		this.dict = require("./bot.json")
		/** Die Websocketverbindung
		*/
		this.client = new WebSocketClient()
		/**
		 * Wenn der Websocket verbunden ist, dann setzten wir ihn auf true
		 */
		this.connected = false

		/**
		 * Wenn die Verbindung nicht zustande kommt, dann läuft der Aufruf hier hinein
		 */
		this.client.on('connectFailed', function (error) {
			console.log('Connect Error: ' + error.toString())
		})

		/** 
		 * Wenn der Client sich mit dem Server verbindet sind wir hier 
		 */
		this.client.on('connect', function (connection) {
			this.con = connection
			console.log('WebSocket Client Connected')
			connection.on('error', function (error) {
				console.log('Connection Error: ' + error.toString())
			})

			// this.client.con.sendUTF('{"type": "msg", "name": "' + 
			// 	'Chatbot' + 
			// 	'", "msg": "' + 
			// 	'Guten Tag' + 
			// 	'", "images":"' + 
			// 	[] + 
			// 	'", "links":"' + 
			// 	[] +
			// 	'"}')
			/** 
			 * Es kann immer sein, dass sich der Client disconnected 
			 * (typischer Weise, wenn der Server nicht mehr da ist)
			 */
			connection.on('close', function () {
				console.log('echo-protocol Connection Closed')
			})

			/** 
			 *    Hier ist der Kern, wenn immmer eine Nachricht empfangen wird, kommt hier die 
			 *    Nachricht an. 
			 */
			connection.on('message', function (message) {
				if (message.type === 'utf8') {
					var data = JSON.parse(message.utf8Data)
					// console.log("Bot Data -> " + JSON.stringify(message))
					// console.log('Received: ' + data.msg + ' ' + data.name + ' ' + data.video)
				}
			})

			/** 
			 * Hier senden wir unsere Kennung damit der Server uns erkennt.
			 * Wir formatieren die Kennung als JSON
			 */
			function joinGesp () {
				if (connection.connected) {
					connection.sendUTF('{"type": "join", "name":"Chatbot"}')
					connection.sendUTF('{"type": "msg", "name": "' + 
						'Chatbot' + 
						'", "msg": "' + 
						'Guten Tag' + 
						'", "images":"' + 
						[] + 
						'", "links":"' + 
						[] +
						'"}')
				}
			}
			joinGesp()
		})
	}

	/**
	 * Methode um sich mit dem Server zu verbinden. Achtung wir nutzen localhost
	 * 
	 */
	connect () {
		this.client.connect('ws://localhost:8181/', 'chat')
		this.connected = true
	}

	/** 
	 * Hier muss ihre Verarbeitungslogik integriert werden.
	 * Diese Funktion wird automatisch im Server aufgerufen, wenn etwas ankommt, das wir 
	 * nicht geschrieben haben
	 * @param nachricht auf die der bot reagieren soll
	 */
	post (nachricht, greeting) {
		if (greeting){
			this.client.con.sendUTF('{"type": "msg", "name": "' + 
				'Chatbot' + 
				'", "msg": "' + 
				'Guten Tag' + 
				'", "images":"' + 
				[] + 
				'", "links":"' + 
				[] +
				'"}')
		}else{
			var name = 'Chatbot'
			var msg = ''
			var images = []
			var links = []

			/*
			 * Verarbeitung
			 */



			// console.log(this.dict)
			var countries = []
			for(var i in this.dict.countries){
				countries.push(Object.keys(this.dict.countries[i])[0])
			}
			// // console.log(countries)
			var si

			// console.log(si[1][0]['definition'][0])
			// console.log(si[1][1]['preis'][0])
			// console.log(si[1][2]['öffnung'][0])

			function getSightData(sight){
				// console.log(sight.length)
				return sight[Math.floor(Math.random()*sight.length)]
			}


			// console.log(json.sights[0])

			for(var i in countries){
				if(nachricht.includes(countries[i])){
					for(var j in this.dict.countries){
						if(countries[j] == countries[i]){
							si = getSightData(Object.entries(this.dict.sights[j]))
							// console.log(si)
						}
					}
					msg = si[1][0]['definition'][0]
					// console.log(si[1][0]['definition'][0])
				}
			}


			var msg = '{"type": "msg", "name": "' + 
				name + 
				'", "msg": "' + 
				msg + 
				'", "images":"' + 
				images + 
				'", "links":"' + 
				links +
				'"}'
			// console.log('Send: ' + msg)
			this.client.con.sendUTF(msg)
		}
	}

}

module.exports = bot
