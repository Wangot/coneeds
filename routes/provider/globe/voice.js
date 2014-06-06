exports.voice = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
  
	tropo.say("<speak><prosody rate='80%'>Welcome to con-needs.</prosody></speak>");

  	// Demonstrates how to use the base Tropo action classes.
  	var say = new Say("<speak><prosody rate='70%'>to SEARCH press 1.......... to CONNECT press 2.......... to check your BALANCE press 3.........</prosody></speak>", null, null, null, null, null);

  	var choices = new Choices("[1 DIGIT]", "dtmf", "#");
  
  	// Action classes can be passes as parameters to TropoWebAPI class methods.
  	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/processChoices", true);
	tropo.on("hangup", null, "http://coneeds.98labs.com:8080/globe/voice/hangup", true);
  	res.send(tropowebapi.TropoJSON(tropo));
}

exports.processChoices = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	var actionValue = req.body.result.actions.value;
	//console.log(actionValue);
	switch(actionValue) {
		case '1' : 
			tropo.say("<speak><prosody rate='60%'>You selected to search. please wait...</prosody></speak>");
			tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/askSearch", true);
			res.send(tropowebapi.TropoJSON(tropo));
		break;
		case '2' : 
			tropo.say("<speak><prosody rate='60%'>You selected to connect. please wait...</prosody></speak>");
			tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/askConnect", true);
			res.send(tropowebapi.TropoJSON(tropo));			
		break;
		case '3' : 
			
		break;				
	}
}

exports.askConnect = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	var say = new Say("<speak><prosody rate='70%'>Please enter the I..D..</prosody></speak>", null, null, null, null, null);

	var choices = new Choices("[1 DIGIT]", "dtmf", "#");
	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/doConnect", true);
  	tropo.on("hangup", null, "http://coneeds.98labs.com:8080/globe/voice/hangup", true);
  	res.send(tropowebapi.TropoJSON(tropo));
}

exports.askSearch = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	var say = new Say("<speak><prosody rate='70%'>What is the keyword you are searching?</prosody></speak>", null, null, null, null, null);

	var choices = new Choices("tutor, teacher, lawyer, nurse");
	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/doSearch", true);
  	tropo.on("hangup", null, "http://coneeds.98labs.com:8080/globe/voice/hangup", true);
  	res.send(tropowebapi.TropoJSON(tropo));
}


exports.doConnect = function(req, res) {
	var Q = require('q');
	var path = require('path');
	var modelPath =  path.resolve('./', 'models/orm');
	var User = require(modelPath + '/user')(req.db);

	var actionValue = req.body.result.actions.value;
	//var actionValue = 'teacher';

	Q.ninvoke(User, 'get', actionValue)
	.then(function(user) {
		var arrIds = [];
		arrIds.push(user.id);
		doCall(req, res, arrIds);
	});
}

exports.doSearch = function(req, res) {
	var Q = require('q');
	var path = require('path');
	var modelPath =  path.resolve('./', 'models/orm');
	var User = require(modelPath + '/user')(req.db);

	var actionValue = req.body.result.actions.value;
	//var actionValue = 'teacher';

	Q.ninvoke(User, 'searchProfessional', actionValue)
	.then(function(users) {
		var searchIds = [];
		for (var i in users) {
			searchIds.push(users[i].id);
		}

		doSearching(req, res, searchIds);
	});
}

function doSearching(req, res, searchIds) {
	var Q = require('q');
	var path = require('path');
	var modelPath =  path.resolve('./', 'models/orm');
	var User = require(modelPath + '/user')(req.db);

	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	Q.ninvoke(User, 'get', searchIds[0])
	.then(function(user) {
		var say = new Say("<speak><prosody rate='70%'>"+ user.short_desc +"</prosody></speak>", null, null, null, null, null);

		var choices = new Choices("call, next, end");
		var arrayString = searchIds.join(',');

		tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
	  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/processSearch?id="+ arrayString, true);
	  	res.send(tropowebapi.TropoJSON(tropo));
	})
	.fail(function() {
		tropo.hangup();
		res.send(tropowebapi.TropoJSON(tropo));
	});


}

function doCall(req, res, searchIds) {
	var Q = require('q');
	var path = require('path');
	var modelPath =  path.resolve('./', 'models/orm');
	var User = require(modelPath + '/user')(req.db);

	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();	
	console.log(searchIds[0]);
	Q.ninvoke(User, 'get', parseInt(searchIds[0]))
	.then(function(user) {
		console.log(user);
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

		tropo.transfer([user.number, "sip:21581127@sip.tropo.com"], null, choices, null, null, null, on, null, null);
				 
	 	res.send(tropowebapi.TropoJSON(tropo));
	})
	.fail(function() {
		tropo.hangup();
		res.send(tropowebapi.TropoJSON(tropo));	
	});

}

exports.processSearch = function(req, res) {
	var actionValue = req.body.result.actions.value;

	switch(actionValue) {
		case 'next':
			var ids = req.query.id;
			var arrayIds = ids.split(',');
			arrayIds.splice(0,1);
			doSearching(req, res, arrayIds);
		break;
		case 'call':
			var ids = req.query.id;
			var arrayIds = ids.split(',');
			console.log(arrayIds);
			doCall(req, res, arrayIds);
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