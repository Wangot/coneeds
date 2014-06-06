module.exports = function(app){

	require('./api')(app);

	require('./provider')(app);

	app.post("/eman",function(req, res) { 
		console.log(req.body);

		res.end("hello"); });

	app.get('/dbSync', require("./tools/dbSync"));
}