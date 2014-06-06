module.exports = function(req, res){
	var tropowebapi = require('tropo-webapi');
  	var tropo = new tropowebapi.TropoWebAPI();
  	tropo.say("<speak><prosody rate='70%'>Hello World!</prosody></speak>");
  	res.send(tropowebapi.TropoJSON(tropo));
}