var path = require('path')
  , coneedsAPI = require(path.resolve('./models/api'));

var Q = require('q');
var utilities = require(path.resolve('./libraries/g8labs/utilities'));
var config = utilities.config.load('config', 'config');
var configProvider = utilities.config.load('config', 'config-provider');
var globe = require(path.resolve('./libraries/providers/globe')+'/globeapi')();

module.exports = function(request, response) {
	var code = 'noS5Bd9qfrMKKMUoGEBjCjAr9psEBA86HKaxjBsq48qEUqoKapHnyMXjtEaL6Kt8gKbRueLbkRI6gR5dtX99r6sBeEj6U8gK86Ha85jot9a6x6hjRgEaSaXRKpu4RiojodcRaxuGzga5SGp6Bohqx5o9td4KMKHAzEjLUdn99zsgeRyRtxjbxpIeqK9XuEML57tAaME9tpyK5zHge8M9Uo6xREsBjA9jHzrrbKskrEekCAkKLaUEKdp6f5g5jxSX';

	// Application Settings
	var appShortCode = configProvider.globe.short_code; // full short code
	var appId = configProvider.globe.app_id; // application id
	var appSecret = configProvider.globe.app_secret; // application secret

	// Getting the login url
	var auth = globe.Auth(appId, appSecret);

	auth.getAccessToken(code, function(req, res) {
	    var data = res.body;

	    // we assumed that the request is successful
	    if (res.statusCode === 200 && data && data['access_token']) {
	        // Get the access_token and subscriber number
	        var accessToken = data['access_token'];
	        var subscriberNumber = data['subscriber_number'];
	        console.log(subscriberNumber);

	        // Build up SMS
	         var sms = globe.SMS(appShortCode, subscriberNumber, accessToken);
	//        sms.setLogger(console); // uncomment to log request

	        // Sends a message
	         var message = 'Hello BUENA MAY' + new Date().toISOString(); // set your custom message here
	         sms.sendMessage(message, function(req, res) {
	             // console.log('SMS Response:', res.body);
	            console.log("SENT");
	            response.send("successfully sent.");
	         });
	    }
	});

}
	