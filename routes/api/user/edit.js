var path = require('path')
  , coneedsAPI = require(path.resolve('./models/api'));

module.exports = function(req, res) {
    coneedsAPI.user.edit(req, res);
};