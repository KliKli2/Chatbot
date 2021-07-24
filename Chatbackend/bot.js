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
	 *	Function to return all countries or if set a maximum amount, that are attractive through certain characteristics
	 * */
	getCountryWithCharacteristic(character, max){
		var ret = []
		if(max == -1){
			max = 5
		}
		for(var i in dict.countries){
			if(dict.countries[i].character.includes(character) && ret.length < max){
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
		for(var i in dict.countries){
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
		if(responses == null || responses == undefined){
			return []
		}
		return responses[Math.floor(Math.random()*responses.length)]
	}

	/*
	 *	Function to get a working String made from the given object
	 * */
	processSights(sights, all){
		let ret = "|"
		if(!all){
			let sight = this.getRandomElement(sights)
			ret += "~" + sight.name + "~"
			ret += "#" + sight.definition + "#"
			ret += "$" + sight.preis + "$"
			ret += "@" + sight.öffnung + "@"
			ret += "|"
			return ret
		}else{
			for(var i in sights){
				ret += "~" + sights[i].name + "~"
				ret += "#" + sights[i].definition + "#"
				ret += "$" + sights[i].preis + "$"
				ret += "@" + sights[i].öffnung + "@"
				ret += "|"
			}
			return ret
		}
	}

	/*
	 *	Function to process multiple Countries and their information for the response
	 * */
	processChars(countries){
		let ret = ""
		for (var i in countries){
			ret += "+" + countries[i]
		}
		ret += "+"
		return ret
	}

	/*
	 *	Function to return a processed string with a formatted list.
	 * */
	processList(list){
		let ret = ""
		for (var i in list){
			ret += "+" + list[i]
		}
		ret += "+"
		return ret
	}

	/*
	 *	Function to separate links, swaps certain keywords and formats the final message
	 * */
	postProcessMsg(msg){
		if(!msg){
			if(this.desiredCountry.length > 0){
				return '{"type": "msg", "name": "' + 
					this.name + 
					'", "msg": "' + 
					this.getRandomElement(this.getCountry(this.desiredCountry[0]).noResponse) + 
					'", "images":"' + 
					this.images + 
					'", "links":"' + 
					this.links +
					'"}'
			}else{
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
		}
		if (msg.search("ALLCOUNTRIES") != -1){
			msg = msg.replace("ALLCOUNTRIES", this.processList(this.getCountryNames()))
		}
		if (msg.search("R5CKULINARISCH") != -1){
			msg = msg.replace("R5CKULINARISCH", this.processChars(this.getCountryWithCharacteristic("kulinarisch", 5)))
		}
		if (msg.search("ALLSIGHTS") != -1){
			msg = msg.replace("ALLSIGHTS", this.processSights(this.getCountry(this.desiredCountry[0]).sights, true))
		}
		if (msg.search("RCSIGHT") != -1){
			msg = msg.replace("RCSIGHT", this.processSights(this.getCountry(this.desiredCountry[0]).sights, false))
		}
		if (msg.search("RCSEASON") != -1){
			msg = msg.replace("RCSEASON", this.capitalize(this.getRandomElement(this.getCountry(this.desiredCountry[0]).season)))
		}
		if (msg.search("RCCHARACTER") != -1){
			msg = msg.replace("RCCHARACTER", this.capitalize(this.getRandomElement(this.getCountry(this.desiredCountry[0]).character)))
		}
		if (msg.search("RSEASON") != -1){
			msg = msg.replace("RSEASON", this.capitalize(this.getRandomElement(dict.seasons)))
		}
		if (msg.search("RCHARACTER") != -1){
			msg = msg.replace("RCHARACTER", this.capitalize(this.getRandomElement(dict.characters)))
		}
		if (msg.search("RCOUNTRY") != -1){
			msg = msg.replace("RCOUNTRY", this.capitalize(this.getRandomElement(this.getCountryNames())))
		}
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
		for (var i in dict.countries){
			if(dict.countries[i].name == name){
				return dict.countries[i]
			}
		}
		return null
	}

	/*
	 *	Function to make the first letter into uppercase
	 * */
	capitalize(string){
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/*
	 *	Function to determine if the sentence has one of the words included, that should trigger the word spotting algorithm
	 *	It also checks for multiple usage of that specific word and returns the corresponding message
	 * */
	hasKeyword(sentence){
		let countries = this.getCountryNames()
		for(var i in countries){
			if(sentence.includes(countries[i]) || sentence.includes(this.capitalize(countries[i]))){
				if(!this.desiredCountry.includes(countries[i])){
					this.usedKeyWords.length = 0
					this.desiredCountry.length = 0
					this.desiredCountry.push(countries[i])
				}
			}
		}

		for(var i in dict.seasons){
			if(sentence.includes(this.capitalize(dict.seasons[i])) || sentence.includes(dict.seasons[i])){
				if(this.getCountryInSeason(dict.seasons[i]).length > 0){
					this.desiredCountry = this.desiredCountry.concat(this.getCountryInSeason(dict.seasons[i]))
					return "Hier sind einige Länder, die in diesen Jahreszeiten angenehm zu Besuchen sind: " + this.processList(this.desiredCountry)
				}
			}
		}

		for(var i in dict.characters){
			if(sentence.includes(this.capitalize(dict.characters[i])) || sentence.includes(dict.characters[i])){
				if(this.getCountryWithCharacteristic(dict.characters[i], -1).length > 0){
					this.desiredCountry = this.desiredCountry.concat(this.getCountryWithCharacteristic(dict.characters[i], -1))
				}
			}
		}

		if(this.desiredCountry.length > 0){
			for (var countryidx in this.desiredCountry) {
				var countryObj = this.getCountry(this.desiredCountry[countryidx])
				for (var i in countryObj.possibilities){
					for (var j in countryObj.possibilities[i].keyword){
						if(sentence.includes(this.capitalize(countryObj.possibilities[i].keyword[j])) || sentence.includes(countryObj.possibilities[i].keyword[j])){
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
		// nachricht = nachricht.toLowerCase()
		this.links.length = 0
		this.images.length = 0
		msg = this.hasKeyword(nachricht)
		msg = this.postProcessMsg(msg)
		this.client.con.sendUTF(msg)
	}

}

module.exports = bot
