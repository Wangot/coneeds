module.exports = function(app){

  require('./api')(app);

  require('./provider')(app);

  app.post("/eman",function(req, res) { res.end("hello"); });

  app.get('/dbSync', require("./tools/dbSync"));

  app.get('/', index);

  app.post('/otp/validate', validateOTP)

  app.get('/dashboard', dashboard)
}

var Q = require('q');
var path = require('path'),
    modelsPath = path.resolve('./models/orm');

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
  res.render('dashboard', {});
}