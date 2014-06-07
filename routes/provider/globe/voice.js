exports.voice = function(req, res) {
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
  
	tropo.say("<speak><prosody rate='80%'>Welcome to con-needs.</prosody></speak>");

  	// Demonstrates how to use the base Tropo action classes.
  	var say = new Say("<speak><prosody rate='70%'>to SEARCH press 1.......... to CONNECT press 2.......... </prosody></speak>", null, null, null, null, null);

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
			tropo.say("<speak><prosody rate='60%'>You selected to search... please wait...</prosody></speak>");
			tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/askSearch", true);
			res.send(tropowebapi.TropoJSON(tropo));
		break;
		case '2' : 
			tropo.say("<speak><prosody rate='60%'>You selected to connect... please wait...</prosody></speak>");
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

	//@TODO this only the limit update this in future
	var choices = new Choices("[1 DIGIT]", "dtmf", "#");
	tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/doConnect", true);
  	tropo.on("hangup", null, "http://coneeds.98labs.com:8080/globe/voice/hangup", true);
  	res.send(tropowebapi.TropoJSON(tropo));
}

exports.askSearch = function(req, res) {
	var Q = require('q');
	var path = require('path');
	var modelPath =  path.resolve('./', 'models/orm');
	var User = require(modelPath + '/user')(req.db);

	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();

	Q.ninvoke(User, 'getUserKeywords')
	.then(function(users) {
		var keywords = [];
		for (var i in users) {
			keywords.push(users[i].keywords);
		}

		var keywordString = keywords.join(',');

		var say = new Say("<speak><prosody rate='70%'>Please tell me what you are looking for.</prosody></speak>", null, null, null, null, null);
		var choices = new Choices(keywordString);
		tropo.ask(choices, 5, false, null, "foo", null, true, say, 5, null);
	  	tropo.on("continue", null, "http://coneeds.98labs.com:8080/globe/voice/doSearch", true);
	  	tropo.on("hangup", null, "http://coneeds.98labs.com:8080/globe/voice/hangup", true);
	  	res.send(tropowebapi.TropoJSON(tropo));
	})
	.fail(function() {
		tropo.on("hangup", null, "http://coneeds.98labs.com:8080/globe/voice/hangup", true);
		res.send(tropowebapi.TropoJSON(tropo));
	});
}


exports.doConnect = function(req, res) {
	var Q = require('q');
	var path = require('path');
	var modelPath =  path.resolve('./', 'models/orm');
	var User = require(modelPath + '/user')(req.db);

	var actionValue = req.body.result.actions.value;

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

		//say
		doSearching(req, res, searchIds, true);
	});
}

function doSearching(req, res, searchIds, isFirst) {
	var Q = require('q');
	var path = require('path');
	var modelPath =  path.resolve('./', 'models/orm');
	var User = require(modelPath + '/user')(req.db);

	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
	Q.ninvoke(User, 'get', searchIds[0])
	.then(function(user) {

		var say;
		var appendSay = 'What would you like to do? CALL? or NEXT?';
		if (searchIds.length == 1) {
			appendSay = 'This is the last item on the list. Goodbye.';
		}

		if(isFirst) {
			var resultCount = searchIds.length;

			say = new Say("<speak><prosody rate='70%'>I have found " + resultCount + " results... The first result is..." + user.short_desc + appendSay +"</prosody></speak>", null, null, null, null, null);
		} else {
			say = new Say("<speak><prosody rate='70%'>"+ user.short_desc + appendSay +"</prosody></speak>", null, null, null, null, null);
		}

		console.log(say);

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
	Q.ninvoke(User, 'get', parseInt(searchIds[0]))
	.then(function(user) {
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
			doSearching(req, res, arrayIds, false);
		break;
		case 'call':
			var ids = req.query.id;
			var arrayIds = ids.split(',');
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