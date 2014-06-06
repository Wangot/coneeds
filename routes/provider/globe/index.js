module.exports = function attachHandlers (router) {

	router.get('/globe/callback', require('./callback'));

    router.post('/globe/notification', require('./notification'));

    router.get('/globe/testSend', require('./sampleSendMessage'));

    var Voice = require('./voice');

    router.post('/globe/voice', Voice.voice);
    router.post('/globe/voice/askSearch', Voice.askSearch);
    router.post('/globe/voice/doSearch', Voice.doSearch);
    router.post('/globe/voice/processSearch', Voice.processSearch);

    router.post('/globe/voice/hangup', Voice.hangup);

    router.get('/topup', require('./topUp'));
    router.get('/credits', function(req, res) {
      var path = require('path'),
          modelsPath = path.resolve('./models/orm');

      var creditHistoryModel = require(modelsPath + '/creditsHistory')(req.db);
      
      creditHistoryModel.createEntry('consume', -100, 1, function(err, savedHistory) {
        console.log(err, savedHistory);
      });

      res.writeHead(400); // Bad Request
      res.end('Credits!');
    });
};