module.exports = function(app){
	app.get("/eman",function(req, res) { res.end("hello"); });
}