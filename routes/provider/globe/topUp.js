module.exports = function(req, res) {

  var path = require('path'),
      modelsPath = path.resolve('./models/orm'),
      globePath = path.resolve('./libraries/providers/globe');

  var utilities = require(path.resolve('./libraries/g8labs/utilities'));
  var config = utilities.config.load('config', 'config');
  var configProvider = utilities.config.load('config', 'config-provider');

  var User = require(path.join(modelsPath, '/user'))(req.db);

  // Use require('globe') if globe is on node_module folder
  var globe = require(globePath+'/globeapi.js')(); // default application version is v1

  // Application Settings
  // var appShortCode = '<APP_SHORT_CODE>'; // full short code
  // var appId = '<APP_ID>'; // application id
  // var appSecret = '<APP_SECRET>'; // application secret

  var appShortCode = configProvider.globe.short_code;
  var appId = configProvider.globe.app_id; // application id
  var appSecret = configProvider.globe.app_secret; // application secret

  // Getting the login url
  var auth = globe.Auth(appId, appSecret);

  // Getting the access token and subscriber number using the code received by the app's redirect uri
  var code = req.query['code'];

  // check the code
  if (!code) {
      response.writeHead(400); // Bad Request
      response.end('No code query!');
      return;
  }

  auth.getAccessToken(code, function(req, res) {
      var data = res.body;
      console.log('Code Response:', data);

      // we assumed that the request is successful
      if (res.statusCode === 200 && data && data['access_token']) {
          // Get the access_token and subscriber number
          var accessToken = data['access_token'];
          var subscriberNumber = data['subscriber_number'];

          // Build up SMS
          // var sms = globe.SMS(appShortCode, subscriberNumber, accessToken);
  //        sms.setLogger(console); // uncomment to log request

          // Sends a message
          // var message = 'Hello World ' + new Date().toISOString(); // set your custom message here
          // sms.sendMessage(message, function(req, res) {
          //     console.log('SMS Response:', res.body);
          // });

          // Build up Payment
          var payment = globe.Payment(subscriberNumber, accessToken);
  //        payment.setLogger(console); // uncomment to log request
          var refCode = '11391000001'; // ref code
          var amount = '1.00'; // set amount to 0.00 as charge amount

          // Charge the subscriber
          payment.charge(amount, refCode, function(req, res) {
              console.log('Payment Response:', res.body);
          });
      }
  });

  response.writeHead(400); // Bad Request
  response.end('Topped-Up!');

};