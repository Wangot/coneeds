var path = require('path')
  , coneedsAPI = require(path.resolve('./models/api'))
  , modelsPath = path.resolve('./models/orm');

var Q = require('q');
var utilities = require(path.resolve('./libraries/g8labs/utilities'));
var config = utilities.config.load('config', 'config');
var configProvider = utilities.config.load('config', 'config-provider');
var globe = require(path.resolve('./libraries/providers/globe')+'/globeapi')();

var helperFunctions = utilities.helperFunctions;
module.exports = function(request, response) {

	// Application Settings
	var appShortCode = configProvider.globe.short_code; // full short code
	var appId = configProvider.globe.app_id; // application id
	var appSecret = configProvider.globe.app_secret; // application secret

    var User = require(path.join(modelsPath, '/user'))(request.db);

	// Getting the login url
	var auth = globe.Auth(appId, appSecret);

    // Express Framework automatically parse the queries
    var code = request.query['code'];

    // check the code
    if (!code) {
        response.writeHead(400); // Bad Request
        response.end('No code query!');
        return;
    }

    // Comment this line if you want to use the sample code of getting the access token
    // Sends the code as JSON
    // response.end(JSON.stringify({
    //     'code' : code
    // }, null, 4));

   // Sample code of getting the access token
   // Get the access token now using the code
   auth.getAccessToken(code, function(req, res) {
       var data = res.body;
       // we assumed that the request is successful
       if (res.statusCode === 200 && data && data['access_token']) {
           // Get the access_token and subscriber number
           var accessToken = data['access_token'];
           var subscriberNumber = data['subscriber_number'];

            console.log('Access Token:', accessToken);
            console.log('Subscriber Number:', subscriberNumber);

           	Q.ninvoke(User, 'find', {number:subscriberNumber})
           	.then(function(users){
           		if (users.length > 0) {
           			return Q.ninvoke(User, 'get', users[0].id);
           		} else {
           			return Q.ninvoke(User, 'create', {number:subscriberNumber, status: 'ACTIVE'});
           		}
           	})
		   	.then(function(user){
		   		// generate
		   		var otp_code = User.generateOTPCode(user.number);
		   		user.otp_code = otp_code;
		   		user.code = code;

		        // expiration
		   		var expiryDate = user.computeExpiryDate(new Date());
          		user.expired = helperFunctions.dateToMysqlFormat(expiryDate);

		   		return Q.ninvoke(user, 'save');
		   	})
		   	.then(function(savedUser){

		   		var deferred = Q.defer();

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

				        // Sends a message
				         var message = 'Your One-Time Password is :' + savedUser.otp_code + ', please enter within 1hr.'; // set your custom message here
				         sms.sendMessage(message, function(req, res) {
				             // console.log('SMS Response:', res.body);
				            // console.log("SENT");
				            // response.send("successfully sent.");
				            deferred.resolve(res.body);
				         });
				    } else {
				    	deferred.reject({error:true});
				    }
				});
				
				return deferred.promise;
		   	})
			.then(function(promise){
				if (promise.error && promise.error == true) {
					throw new Error("Unable to send message.")
				} else {
					response.redirect('http://coneeds.98labs.com:8080?code='+code);
				}
			})
		    .fail(function(err) {
		      console.log(err);
		      response.end(JSON.stringify(data, null, 4));
		    });

           // Sends the error
           // response.end(JSON.stringify(data, null, 4));
       } else {
           // Sends the error
           response.end(JSON.stringify(data, null, 4));
       }
   });
};