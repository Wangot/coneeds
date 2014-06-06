module.exports = function(req, res){
	var tropowebapi = require('tropo-webapi');
	var tropo = new tropowebapi.TropoWebAPI();
  	tropo.say("Hello World!");
  	res.send(tropowebapi.TropoJSON(tropo));
}