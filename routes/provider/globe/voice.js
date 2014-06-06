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


exports.doSearch = function(req, res) {
	var searchIds = [1, 2, 3];
	doSearching(res, searchIds);
}

function doSearching(res, searchIds) {
	var searchQuery = { 'data': [{ 'id': '1', 'name' : 'I am Raymande Leano', 'number' : '123456'}, 
								{ 'id': '2', 'name' : 'Boom Panis!', 'number' : '123456'}] 
						};
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();

	
	var say = new Say("<speak><prosody rate='70%'>"+ searchQuery.data[searchIds[0] - 1].name +"</prosody></speak>", null, null, null, null, null);

	var arrayString = searchIds.join(',');

	var choices = new Choices("call, next, end");

	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/processSearch?id="+ arrayString, true);
  	res.send(tropowebapi.TropoJSON(tropo));
}

exports.processSearch = function(req, res) {
	var actionValue = req.body.result.actions.value;
	/*
	tropo.say(actionValue);
	res.send(tropowebapi.TropoJSON(tropo));
	*/
	if (actionValue == 'next') {
		var ids = req.query.id;
		var arrayIds = ids.split(',');
		arrayIds.splice(0,1);
		doSearching(res, arrayIds);
	}
}