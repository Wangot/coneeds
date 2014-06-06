module.exports = function attachHandlers (router) {

	router.get('/globe/callback', require('./callback'));

    router.post('/globe/notification', require('./notification'));

    router.get('/globe/testSend', require('./sampleSendMessage'));

    var Voice = require('./voice');

    router.post('/globe/voice', Voice.voice);
    router.post('/globe/voice/askSearch', Voice.askSearch);
    router.post('/globe/voice/doSearch', Voice.doSearch);
};