module.exports = function(app){

  require('./api')(app);

  require('./provider')(app);

  app.post("/eman",function(req, res) { res.end("hello"); });

  app.get('/dbSync', require("./tools/dbSync"));

  app.get('/', index);

  app.post('/otp/validate', validateOTP);

  app.get('/dashboard', dashboard);

  app.post('/otp/validate', validateOTP);

  app.post('/login', login);

  app.get('/logout', logout);

  app.get('/testSearch', function(req, res) {

    var path = require('path'), 
        coneedsAPI = require(path.resolve('./models/api'));

    var modelsPath = path.resolve('./models/orm');
    var User = require(path.join(modelsPath, '/user'))(req.db);

    User.searchProfessional('brown', function(err, data) {
      console.log(err, data);
    });

    res.send('test');
  });

}

var Q = require('q');
var path = require('path'),
    modelsPath = path.resolve('./models/orm');

var utilities = require(path.resolve('./libraries/g8labs/utilities'));
var config = utilities.config.load('config', 'config');
var configProvider = utilities.config.load('config', 'config-provider');
var globe = require(path.resolve('./libraries/providers/globe')+'/globeapi')();
var helperFunctions = utilities.helperFunctions;

var index = function(req, res) {

  var User = require(path.join(modelsPath, '/user'))(req.db);
  var iCode;

    // accommodate GET and POST or even invoice code passed
    if (req.body.code) {
      iCode = req.body.code;
    }

   if (!iCode) {
    iCode = req.query.code;
  } 

  if (!iCode) {
    iCode = req.params.code;
  }

  Q.ninvoke(User, 'find', {code: iCode})
  .then(function(users){
    if (users.length > 0 && users[0].otp_code) {
      res.render('index', {show_otp: true, code: iCode});
    } else {
      res.render('index', {show_otp: false, code: iCode});
    }
  })
  .fail(function(err){
    console.log(err);
     res.render('index', {show_otp: false, code: iCode});
  })
  
  
};

var validateOTP = function(req, res) {
  var User = require(path.join(modelsPath, '/user'))(req.db);
  var iCode, otpCode;
  // accommodate GET and POST or even invoice code passed
  if (req.body.code) {
    iCode = req.body.code;
  }

  otpCode = req.body.otp_code;

  if (!iCode) {
    iCode = req.query.code;
  } 

  if (!iCode) {
    iCode = req.params.code;
  }

  return Q.ninvoke(User, 'find', {code: iCode})
  .then(function(users){
    if (users.length > 0 && users[0].otp_code &&
      users[0].otp_code == otpCode) {
      // res.render('dashboard', {});
      req.session.user = users[0];
      res.redirect('/dashboard');
    } else {
      res.redirect('/?code='+iCode);
      // res.render('index', {show_otp: true, code: iCode});
    }
  })
  .fail(function(err){
    console.log(err);
    res.redirect('/?code='+iCode);
     // res.render('index', {show_otp: true, code: iCode});
  })
}

var dashboard = function(req, res) {
  res.render('dashboard', {user: req.session.user});
}

var login = function(request, response) {
  var User = require(path.join(modelsPath, '/user'))(request.db);
  var subscriberNumber, code;

  var appShortCode = configProvider.globe.short_code; // full short code
  var appId = configProvider.globe.app_id; // application id
  var appSecret = configProvider.globe.app_secret; // application secret

  // Getting the login url
  var auth = globe.Auth(appId, appSecret);

  // accommodate GET and POST or even invoice code passed
  if (request.body.number) {
    subscriberNumber = request.body.number;
  }

  if (!subscriberNumber) {
    subscriberNumber = request.query.number;
  } 

  if (!subscriberNumber) {
    subscriberNumber = request.params.number;
  }

  Q.ninvoke(User, 'find', {number:subscriberNumber})
      .then(function(users){
        if (users.length > 0) {
          return Q.ninvoke(User, 'get', users[0].id);
        } else {
          throw new Error("User not found");
        }
      })
  .then(function(user){
    // generate
    var otp_code = User.generateOTPCode(user.number);
    user.otp_code = otp_code;
    user.status = 'ACTIVE';

    // expiration
    var expiryDate = user.computeExpiryDate(new Date());
        user.expired = helperFunctions.dateToMysqlFormat(expiryDate);

    return Q.ninvoke(user, 'save');
  })
  .then(function(savedUser){
    code = savedUser.code;
    var deferred = Q.defer();

    auth.getAccessToken(code, function(req, res) {
      var data = res.body;
      // we assumed that the request is successful
      if (res.statusCode === 200 && data && data['access_token']) {
          // Get the access_token and subscriber number
          var accessToken = data['access_token'];
          var subscriberNumber = data['subscriber_number'];

          // Build up SMS
           var sms = globe.SMS(appShortCode, subscriberNumber, accessToken);

          // Sends a message
           var message = 'Your One-Time Password is ' + savedUser.otp_code + ', please enter within 1hr.'; // set your custom message here
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
  .then(function(promise) {
    if (promise.error && promise.error == true) {
      throw new Error("Unable to send message.")
    } else {
      response.redirect('http://coneeds.98labs.com:8080?code='+code);
    }
  })
  .fail(function(err) {
    console.log(err);
    response.redirect('http://coneeds.98labs.com:8080?failedLogin=true&message='+err.message);
  });

}

var logout = function(req, res) {
  if (req.session.user) {
    req.session.user = null;
  }

  res.redirect('/');
}