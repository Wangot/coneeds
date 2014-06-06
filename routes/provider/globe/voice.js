exports.voice = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
  
	tropo.say("<speak><prosody rate='80%'>Welcome to con-needs.</prosody></speak>");

  	// Demonstrates how to use the base Tropo action classes.
  	var say = new Say("<speak><prosody rate='70%'>to SEARCH press 1.......... to CONNECT press 2.......... to check your BALANCE press 3.........</prosody></speak>", null, null, null, null, null);

  	var choices = new Choices("[1 DIGIT]", "dtmf", "#");
  
  	// Action classes can be passes as parameters to TropoWebAPI class methods.
  	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/askSearch", true);
	tropo.on("hangup", null, "http://coneeds.98labs.com:8080/globe/voice/hangup", true);
  	res.send(tropowebapi.TropoJSON(tropo));
}

exports.askSearch = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	var say = new Say("<speak><prosody rate='70%'>What is you category?</prosody></speak>", null, null, null, null, null);

	var choices = new Choices("test, Tutor, Teacher, Lawyer, Nurse");
	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/doSearch", true);
  	tropo.on("hangup", null, "http://coneeds.98labs.com:8080/globe/voice/hangup", true);
  	res.send(tropowebapi.TropoJSON(tropo));
}


exports.doSearch = function(req, res) {
	var searchIds = [1, 2, 3];
	doSearching(res, searchIds);
}

function doSearching(res, searchIds) {
	var searchQuery = { 'data': [{ 'id': '1', 'name' : 'I am Raymande Leano', 'number' : '123456'}, 
								{ 'id': '2', 'name' : 'Boom Panis!', 'number' : '123456'},
								{ 'id': '2', 'name' : 'Meeeeeeee!', 'number' : '123456'}] 
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

function doCall() {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();		
	tropo.say("Please hold while we transfer your superman call!");
	var on = [
	   { "event":"ring",
	      "say":{
	         "value":"http://www.phono.com/audio/holdmusic.mp3"
	      },
	   }
	];
			 
	var choices = {
	   "terminator": "#"
	}

	tropo.transfer(["9154980404", "sip:21581127@sip.tropo.com"], null, choices, null, null, null, on, null, null);
			 
 	res.send(tropowebapi.TropoJSON(tropo));
}

exports.processSearch = function(req, res) {
	var actionValue = req.body.result.actions.value;

	switch(actionValue) {
		case 'next':
			var ids = req.query.id;
			var arrayIds = ids.split(',');
			arrayIds.splice(0,1);
			doSearching(res, arrayIds);
		break;
		case 'call':
			doCall();
		break;
		case 'end':
			var tropowebapi = require('tropo-webapi');
			var tropo = new tropowebapi.TropoWebAPI();
			tropo.hangup();
			res.send(tropowebapi.TropoJSON(tropo));
		break;
	}

}

exports.hangup = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	tropo.say("<speak><prosody rate='70%'>Thank you for calling!</prosody></speak>");
	res.send(tropowebapi.TropoJSON(tropo));
}

exports.incomplete = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	tropo.say("<speak><prosody rate='70%'>Thank you for calling!</prosody></speak>");
	res.send(tropowebapi.TropoJSON(tropo));	
}

exports.error = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	tropo.say("<speak><prosody rate='70%'>Thank you for calling!</prosody></speak>");
	res.send(tropowebapi.TropoJSON(tropo));
}