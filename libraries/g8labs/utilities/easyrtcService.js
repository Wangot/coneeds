module.exports = function(easyrtc, ormDB) {

  var path = require('path'),
  modelsPath = path.resolve('./models/orm');

  var User = require(path.join(modelsPath, '/user'))(ormDB);

  // Basic Authentication
  var onAuthenticate = function(socket, easyrtcid, appName, username, credential, easyrtcAuthMessage, next) {
    User.find({number:username}, function(err, users) {
      if(err) {
        next(new easyrtc.util.ConnectionError(err.message));
      } else {
        if (users.length > 0 && users[0].number == username) {
          next(null);
        } else {
          next(new easyrtc.util.ConnectionError("Failed our private auth."));
        }
      }
    });
  };
  easyrtc.events.on("authenticate", onAuthenticate);

}