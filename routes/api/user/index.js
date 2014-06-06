module.exports = function attachHandlers (router) {

    // get all the user
	router.get('/api/users', require('./browse'));

    // get one user by id
	router.get('/api/users/:id', require('./read'));

    // update user detail
	router.put('/api/users/:id', require('./edit'));

    // create user
    router.post('/api/users', require('./add'));

    // remove user by id
	router.delete('/api/users/:id', require('./delete'));

};