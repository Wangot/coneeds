var _ = require("underscore");            // General utility functions external module
var async = require("async");             // Asynchronous calls external module

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

/**
* Default listener for event "emitReturnToken". This event is fired when the server should return a token to a client via an acknowledgment message.
* 
* This is done after a client has been authenticated and the connection has been established.
*
* @param       {Object} connectionObj  EasyRTC connection object. Contains methods used for identifying and managing a connection.
* @param       {Function} socketCallback Socket.io callback function which delivers a response to a socket. Expects a single parameter (msg).
* @param       {nextCallback} next     A success callback of form next(err).
*/
var onEmitReturnToken = function(connectionObj, socketCallback, next){
		console.log("["+connectionObj.getAppName()+"]["+connectionObj.getEasyrtcid()+"] Running func 'onSendToken'");

		var tokenMsg = {
			msgType: "token",
			msgData:{}
		};

		var appObj = connectionObj.getApp();

		// Ensure socketCallback is present
		if(!_.isFunction(socketCallback)) {
			console.log("["+connectionObj.getAppName()+"]["+connectionObj.getEasyrtcid()+"] EasyRTC onSendToken called with no socketCallback.");
			try{connectionObj.socket.disconnect();}catch(e){}
			return;
		}

		async.waterfall([
			function(asyncCallback){
				// Get rooms user is in along with list
				connectionObj.generateRoomClientList("join", null, asyncCallback);
			},
			function(roomData, asyncCallback) {
				// Set roomData
				tokenMsg.msgData.roomData = roomData;

				// Retrieve ice config
				connectionObj.events.emit("getIceConfig", connectionObj, asyncCallback);
			},

			function(iceServers, asyncCallback) {
				tokenMsg.msgData.application        = {applicationName:connectionObj.getAppName()};
				tokenMsg.msgData.easyrtcid          = connectionObj.getEasyrtcid();
				tokenMsg.msgData.iceConfig          = {iceServers: iceServers};
				tokenMsg.msgData.serverTime         = Date.now();

				// Get Application fields
				appObj.getFields(true, asyncCallback);
			},

			function(fieldObj, asyncCallback) {
				if (!_.isEmpty(fieldObj)){
					tokenMsg.msgData.application.field = fieldObj;
				}

				// Get Connection fields
				connectionObj.getFields(true, asyncCallback);
			},

			function(fieldObj, asyncCallback) {
				if (!_.isEmpty(fieldObj)){
					tokenMsg.msgData.field = fieldObj;
				}

				// get session object
				connectionObj.getSessionObj(asyncCallback);
			},

			function(sessionObj, asyncCallback) {
				if (sessionObj) {
					tokenMsg.msgData.sessionData = {"easyrtcsid":sessionObj.getEasyrtcsid()};

					// Get session fields
					sessionObj.getFields(true, asyncCallback);
				}
				else {
					asyncCallback(null, null);
				}
			},

			function(fieldObj, asyncCallback) {
				// Set session field (if present)
				if (fieldObj && !_.isEmpty(fieldObj)){
					tokenMsg.msgData.sessionData.field = fieldObj;
				}
				
				var loggedClientUserNames = new Array();
				var loggedClientList = tokenMsg.msgData.roomData.default.clientList;
				//console.log(loggedClientList);
				
				for(var key in loggedClientList) {
					loggedClientUserNames.push(loggedClientList[key].username);
				}
				
				//console.log(loggedClientUserNames);
				
				User.find({ number: loggedClientUserNames }, function(err, users) {
					if(err) 
					{
						//next(new easyrtc.util.ConnectionError(err.message));
						console.log("Fatal Error: " + err);
					} 
					else 
					{
						var userProfiles = {};
						
						for(var key in users) {
							
							var profile = users[key];
							
							userProfiles[profile.number] = {
								"status" : profile.status,
								"number" : profile.number,
								"id" : profile.id,
								"short_desc" : profile.short_desc,
								"avatar" : profile.avatar,
								"screen_name" : profile.screen_name,
								"is_professional" : profile.is_professional,
							};
						}
						
						var loggedClientList = tokenMsg.msgData.roomData.default.clientList;
						
						for(var key in loggedClientList) {
							var loggedClientUsername = loggedClientList[key].username;
							loggedClientList[key].userProfile = userProfiles[loggedClientUsername];
						}
						
						// Emit token back to socket (SUCCESS!)
						socketCallback(tokenMsg);

						asyncCallback(null);
					}
				});
			}

		],
		// This function is called upon completion of the async waterfall, or upon an error being thrown.
		function (err) {
			if (err){
				next(err);
			} else {
				next(null);
			}
		});
	};
	
	easyrtc.events.on("emitReturnToken", onEmitReturnToken);
}