var express = require('express');
var moment = require('moment-timezone');
var cities = require('./data/cities.json');

//Set-up cities by name
var citiesByName = {};
for(var cityKey in cities) {
	var city = cities[cityKey];

	//Parse a string to an int
	city.population = parseInt(city.population);

	if(citiesByName[city.name]) {
		citiesByName[city.name].push(city);
	} else {
		citiesByName[city.name] = [city];
	}
}

var app = express();

function getCity(cityName, countryCode) {
	var cityArray = citiesByName[cityName];

	if(!cityArray) {
		//Error -- no city by that name
		return;
	}

	var returnCity
	if(cityArray.length > 1) {
		//We have more than one city by that name...
		if(!countryCode) {

			//No country code specified -- choose city with largest population
			returnCity = cityArray[0];

			cityArray.forEach(function(city) {
				if(city.population > returnCity.population) {
					returnCity = city;
				}
			});

		} else {
			//Try to find a city that matches the country code
			cityArray.forEach(function(city) {
				//If the city is in the US, use the countryCode passed in to mean state
				if(city.countrycode == countryCode || (city.countrycode == 'US' && city.state == countryCode)) {
					returnCity = city;
				}
			});
		}
	} else {
		//Only one city by that name
		returnCity = cityArray[0];
	}

	return returnCity;
}

app.get('/time/:name/:cc?', function(req, res) {
	var cityName = req.params.name;
	var countryCode = req.params.cc;

	var city = getCity(cityName, countryCode);

	if(!city) {
		//Send error response
		res.statusCode = 400;
		res.send('Could not find city specified');
		return;
	}

	//Calculate local time (for that timezone) here
	var curTime = moment().tz(city.timezone).format();

    res.send({name:cityName, countrycode: city.countrycode, timezone: city.timezone, localtime: curTime});
});

app.listen(process.env.PORT || 3000);
console.log('Listening on port...');
