exports.voice = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
  
	//tropo.say("<speak><prosody rate='70%'>Welcome to my Tropo Web API demo.</prosody></speak>");

  	// Demonstrates how to use the base Tropo action classes.
  	var say = new Say("<speak><prosody rate='70%'>Enter a number</prosody></speak>", null, null, null, null, null);

  	var choices = new Choices("[1 DIGIT]", "dtmf", "#");
  
  	// Action classes can be passes as parameters to TropoWebAPI class methods.
  	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/askSearch", true);

  	res.send(tropowebapi.TropoJSON(tropo));
}

exports.askSearch = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	var say = new Say("<speak><prosody rate='70%'>What is you category?</prosody></speak>", null, null, null, null, null);

	var choices = new Choices("test, Tutor, Teacher, Lawyer, Nurse");
	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/doSearch", true);
  	res.send(tropowebapi.TropoJSON(tropo));

/*
	var actionValue = req.body.result.actions.value;
	tropo.say("You selected" + actionValue);
	res.send(tropowebapi.TropoJSON(tropo));
*/
}

var searchQuery = [{'description' : 'I am Raymande Leano', 'number' : '123456'}, {'description' : 'Boom Panis!', 'number' : '123456'}];

exports.doSearch = function(req, res) {
	doSearching(res);
}

function doSearching(res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();

	var say = new Say("<speak><prosody rate='70%'>"+ searchQuery[0].description +"</prosody></speak>", null, null, null, null, null);

	var choices = new Choices("call, next, end");

	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/processSearch", true);
  	res.send(tropowebapi.TropoJSON(tropo));
}

exports.processSearch = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();

	var actionValue = req.body.result.actions.value;
	tropo.ask(actionValue);
	if (actionValue == 'next') {
		searchQuery[0].remove();
		doSearching(res);
	}
	res.send(tropowebapi.TropoJSON(tropo));
}