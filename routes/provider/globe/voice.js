exports.voice = function(req, res){
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
  
	//tropo.say("<speak><prosody rate='70%'>Welcome to my Tropo Web API demo.</prosody></speak>");

  	// Demonstrates how to use the base Tropo action classes.
  	var say = new Say("<speak><prosody rate='70%'>Enter a number</prosody></speak>", null, null, null, null, null);

  	var choices = new Choices("[1 DIGIT]", "dtmf", "#");
  
  	// Action classes can be passes as parameters to TropoWebAPI class methods.
  	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/search", true);

  	res.send(tropowebapi.TropoJSON(tropo));
}

exports.search = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	var actionValue = req.body.result.actions.value;
	tropo.say("You selected" + actionValue);
	res.send(tropowebapi.TropoJSON(tropo));
}