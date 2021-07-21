'use strict'

var WebSocketClient = require('websocket').client
var dict = require("./bot.json")

/**
 * bot ist ein einfacher Websocket Chat Client
 */

class bot {

	/**
	 * Konstruktor baut den client auf. Er erstellt einen Websocket und verbindet sich zum Server
	 * Bitte beachten Sie, dass die Server IP hardcodiert ist. Sie müssen sie umsetzten
	 */
	constructor () {
		this.usedKeyWords = []
		this.name = "Chatbot"
		this.desiredCountry = []
		this.links = []
		this.images = []

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
						dict.greetings[Math.floor(Math.random()*dict.greetings.length)] + 
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

	/*
	 *	Function to return all countries that are attractive through certain characteristics
	 * */
	getCountryWithCharacteristic(character){
		var ret = []
		for(var i in countries){
			if(dict.countries[i].character.includes(character)){
				ret.push(dict.countries[i].name)
			}
		}
		return ret
	}

	/*
	 *	Function to return all countries that are visitable in a certain season
	 * */
	getCountryInSeason(season){
		var ret = []
		for(var i in countries){
			if(dict.countries[i].season.includes(season)){
				ret.push(dict.countries[i].name)
			}
		}
		return ret
	}

	/*
	 * Function to return a random element from a specific array
	 */
	getRandomElement(responses){
		return responses[Math.floor(Math.random()*responses.length)]
	}

	/*
	 *	Function to separate links, swaps certain keywords and formats the final message
	 * */
	postProcessMsg(msg){
		if(!msg){
			return '{"type": "msg", "name": "' + 
				this.name + 
				'", "msg": "' + 
				this.getRandomElement(dict.noResponse) + 
				'", "images":"' + 
				this.images + 
				'", "links":"' + 
				this.links +
				'"}'
		}
		if (msg.search("RCSIGHT") != -1){
			// Definition, Preis, Oeffnung, Name?
		}
		msg = msg.replace("RCSEASON", this.getRandomElement(this.getCountry(this.desiredCountry[0]).season))
		msg = msg.replace("RCCHARACTER", this.getRandomElement(this.getCountry(this.desiredCountry[0]).character))
		msg = msg.replace("RSEASON", this.getRandomElement(dict.seasons))
		msg = msg.replace("RCHARACTER", this.getRandomElement(dict.characters))
		msg = msg.replace("RCOUNTRY", this.getRandomElement(this.getCountryNames()))
		if(msg.search(/<[\s\S]+>/i) != -1){
			this.links.push(msg.slice(msg.search("<") + 1, msg.search(">")))
			msg = msg.replace(msg.slice(msg.search("<"), msg.search(">") + 1), "")
		}
		return '{"type": "msg", "name": "' + 
			this.name + 
			'", "msg": "' + 
			msg + 
			'", "images":"' + 
			this.images + 
			'", "links":"' + 
			this.links +
			'"}'
	}

	/*
	 *	Function to search and return the list of available countries
	 * */
	getCountryNames(){
		var ret = []
		for(var i in dict.countries){
			ret.push(dict.countries[i].name)
		}
		return ret
	}

	/*
	 *	Function to return the Object with alll information about the country, specified wuth the given name.
	 *	If not available, if returns null
	 * */
	getCountry(name){
		console.log(name)
		for (var i in dict.countries){
			if(dict.countries[i].name == name){
				return dict.countries[i]
			}
		}
		return null
	}

	/*
	 *	Function to determine if the sentence has one of the words included, that should trigger the word spotting algorithm
	 *	It also checks for multiple usage of that specific word and returns the corresponding message
	 * */
	hasKeyword(sentence){

		let countries = this.getCountryNames()
		for(var i in countries){
			if(sentence.includes(countries[i])){
				if(!this.desiredCountry.includes(countries[i])){
					this.usedKeyWords.length = 0
					this.desiredCountry.length = 0
					this.desiredCountry.push(countries[i])
				}
			}
		}

		console.log(this.desiredCountry)
		if(this.desiredCountry.length > 0){
			for (var countryidx in this.desiredCountry) {
				var countryObj = this.getCountry(this.desiredCountry[countryidx])
				console.log(countryObj)
				for (var i in countryObj.possibilities){
					for (var j in countryObj.possibilities[i].keyword){
						if(sentence.includes(countryObj.possibilities[i].keyword[j])){
							if(!this.usedKeyWords.includes(countryObj.possibilities[i].keyword[j])){
								this.usedKeyWords.push(countryObj.possibilities[i].keyword[j])
								return this.getRandomElement(countryObj.possibilities[i].answer)
							}else{
								this.usedKeyWords.splice(this.usedKeyWords.indexOf(countryObj.possibilities[i].keyword[j]), 1)
								return this.getRandomElement(countryObj.possibilities[i].multiple)
							}
						}
					}
				}
			}
		}else{
			for (var i in dict.answers){
				for(var j in dict.answers[i].keyword){
					if(sentence.includes(dict.answers[i].keyword[j])){
						if(!this.usedKeyWords.includes(dict.answers[i].keyword[j])){
							this.usedKeyWords.push(dict.answers[i].keyword[j])
							return this.getRandomElement(dict.answers[i].answer)
						}else{
							this.usedKeyWords.splice(this.usedKeyWords.indexOf(dict.answers[i].keyword[j]), 1)
							return this.getRandomElement(dict.answers[i].multiple)
						}
					}
				}
			}
		}
	}

	/** 
	 * Hier muss ihre Verarbeitungslogik integriert werden.
	 * Diese Funktion wird automatisch im Server aufgerufen, wenn etwas ankommt, das wir 
	 * nicht geschrieben haben
	 * @param nachricht auf die der bot reagieren soll
	 */
	post (nachricht) {
		let msg = ''
		this.links.length = 0
		this.images.length = 0
		msg = this.hasKeyword(nachricht)
		msg = this.postProcessMsg(msg)
		this.client.con.sendUTF(msg)
	}

}

module.exports = bot
