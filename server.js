// Load required modules
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var io      = require("socket.io");         // web socket external module
var easyrtc = require("easyrtc");           // EasyRTC external module

// Setup and configure Express http server. Expect a subfolder called "frontend" to be the web root.
var httpApp = express();
var bodyParser = require('body-parser');
httpApp.use(express.static(__dirname + "/frontend/"));
httpApp.use(bodyParser());

var utilities = require('./libraries/g8labs/utilities');
var config = utilities.config.load('config', 'config');
/* DATABASE SETUP (using node-orm2) */
// 1. mysql 
var ormDB = utilities.db.ormManual(config.db);

// middleware to attach the dbclient to the req obj
httpApp.use(function (req, res, next) {
  req.db = ormDB;
  next();
});

// easy rtc service
utilities.easyrtcService(easyrtc, ormDB);

// Start Express http server on port 8080
var webServer = http.createServer(httpApp).listen(8080);

var routes = require('./routes')(httpApp);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":1});

// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer);
