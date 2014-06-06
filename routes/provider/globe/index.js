module.exports = function attachHandlers (router) {

	router.get('/globe/callback', require('./callback'));

    router.post('/globe/notification', require('./notification'));

    router.get('/globe/testSend', require('./sampleSendMessage'));

    router.post('/globe/voice', require('./voice'));
};