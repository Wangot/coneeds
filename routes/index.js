module.exports = function(app){

	require('./api')(app);

	app.get("/eman",function(req, res) { res.end("hello"); });

	app.get('/dbSync', require("./tools/dbSync"));
}