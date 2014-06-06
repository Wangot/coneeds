module.exports = function(req, res) {

  var Q = require('q');
  var path = require('path'),
      modelsPath = path.resolve('./models/orm'),
      globePath = path.resolve('./libraries/providers/globe');

  var utilities = require(path.resolve('./libraries/g8labs/utilities'));
  var config = utilities.config.load('config', 'config');
  var configProvider = utilities.config.load('config', 'config-provider');

  var User = require(path.join(modelsPath, '/user'))(req.db);
  var CreditsHistory = require(path.join(modelsPath, '/creditsHistory'))(req.db);

  // Use require('globe') if globe is on node_module folder
  var globe = require(globePath+'/globeapi.js')(); // default application version is v1

  // Application Settings
  var liveCodeForHTC = "6kUj6a6BId4Ax5ubjLRnFRan4GspGyA9FxXeq5HAzbRBUMKkd8I7pb8yHjdpRpuxpXnySo9ExBF7oALoH9EGo8tRxrzpsge94Kf68dAMt9MxrLHprpqAuxBRKpu4RTkjaziRaxuGzpBgubexXLH4Gd4ktbB96afr5rR9sKxGektRoAGXHEbEp9FenXpGSqXp5Bue6bR8H57kAjIBGb8EUxGeyaHkMypnFxonakspnL4BFyLABbuRAaApIqEqakUn";

  var appShortCode = "21581139"; // full short code
  var appId = "yk6pAsRzMMeCb5cpa9iMnGC8k6bosa6x"; // application id
  var appSecret = "f407a9828451c8b7a7b9e80ead9a1b4b1bf378ccecc3215f5976a791ae69bdc8"; // application secret

  // var appShortCode = configProvider.globe.short_code;
  // var appId = configProvider.globe.app_id; // application id
  // var appSecret = configProvider.globe.app_secret; // application secret

  // Getting the login url
  var auth = globe.Auth(appId, appSecret);

  // Getting the access token and subscriber number using the code received by the app's redirect uri
  var code = req.query['code'];

  // check the code
  if (!code) {
      res.writeHead(400); // Bad Request
      res.end('No code query!');
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

          var thisUser, latestHistory;
          Q.ninvoke(User, 'find', {number:subscriberNumber})
          .then(function(users) {
            if (users.length > 0) {
              return users[0];
            } else {
              throw Error('Invalid subscriber record.');
            }
          })
          .then(function(xUser) {
            thisUser = xUser;

            return Q.ninvoke(CreditsHistory, 'createEntry', 'top-up', 100, thisUser.id);
          })
          .then(function(savedHistory) {
            latestHistory = savedHistory;

            subscriberNumber = "0" +subscriberNumber.toString();
            var payment = globe.Payment(subscriberNumber, accessToken);
           // payment.setLogger(console); // uncomment to log request
            var refCode = latestHistory.reference_code; // ref code
            var amount = '1.00'; // set amount to 0.00 as charge amount
            // console.log(refCode);
            console.log(subscriberNumber);
            // Charge the subscriber
            var xRefCode = 11391000005;
            payment.charge(amount, xRefCode, function(req, res) {
                console.log('Payment Response:', res.body);
            });
            
          })
          .fail(function(err) {
            console.log(err);
          });

      }
  });

  res.writeHead(400); // Bad Request
  res.end('Topped-Up!');

};