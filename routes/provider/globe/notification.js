module.exports = function(request, response) {
	response.end(JSON.stringify(request.body, null, 4));
}