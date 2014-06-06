module.exports = function(app){

	require('./api')(app);

	app.post("/eman",function(req, res) { 
		console.log(req.body);

		res.end("hello"); });

	app.get('/dbSync', require("./tools/dbSync"));
}