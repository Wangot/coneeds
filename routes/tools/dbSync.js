module.exports = function(req, res){
  var path = require('path'),
      modelsPath = path.resolve('./models/orm');
  var User = require(path.join(modelsPath, '/user'))(req.db);
  var CreditHistory = require(modelsPath + '/creditsHistory')(req.db);

  res.end('SUCCESS');
}