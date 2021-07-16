const data = require("./bot.json")

// console.log(json)
// console.log(typeof data)

countries = []
for(i in data.countries){
	countries.push(Object.keys(data.countries[i])[0])
}
// console.log(countries)
var si
for(i in data.countries){
	if(countries[i] == "italien"){
		si = getSightData(Object.entries(data.sights[i]))
	}
}

console.log(si[1][0]['definition'][0])
console.log(si[1][1]['preis'][0])
console.log(si[1][2]['öffnung'][0])

function getSightData(sight){
	console.log(sight.length)
	return sight[Math.floor(Math.random()*sight.length)]
}


// console.log(json.sights[0])
