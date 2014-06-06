var Q = require('q');
var orm = require('orm');
var url = require('url');
var path = require('path');
var ApiReturn = require('./return');
var modelsPath = path.resolve('./models/orm');
var message = require(path.resolve('./libraries/g8labs/utilities/message'));

module.exports = {
  create: function(req, res) {
    var User = require(path.join(modelsPath, '/user'))(req.db);
    var userDetails = this.formatBeforeCreate(req.body);

    Q.ninvoke(User, 'create', userDetails)
    .then(function(createdUser){
      return res.send(new ApiReturn(true, createdUser, message.DATA_SUCCESSFULLY_CREATED, userDetails));
    })
    .fail(function(err) {
      console.log(err);
      return res.send(new ApiReturn(false, err, message.DATA_FAILED_TO_CREATE, userDetails));
    });
  },
  list: function(req, res){
    var User = require(path.join(modelsPath, '/user'))(req.db);
    var params = req.query;

    var filter = this.filterList(params);

    User.find(filter, function(err, users) {
      if(err) {
        console.log(err);
        res.send(new ApiReturn(false, err, message.ERROR, params));
      }

      // FORMAT the data to be returned
      var arrTemp = [];
      users.forEach(function(user){
        var temp = {
          id: user.id,
          number: user.number,
          status: user.status,
          otp_code: user.otp_code,
          expired: user.expired
        };

        arrTemp.push(temp);
      });

      res.send(new ApiReturn(true, arrTemp, message.DATA_SUCCESSFULLY_RETRIEVED, params));
    });

  },
  filterList: function(params){
    var filterData = {};

    if (params.number) {
      filterData.number = orm.eq(params.number);
    }

    if (params.status) {
      filterData.status = orm.eq(params.status);
    }

    if (params.rtc_id) {
      filterData.rtc_id = orm.eq(params.rtc_id);
    }

    return filterData; 
  },
  formatBeforeCreate: function(rawParams) {
    return {
      number:rawParams.number
    };
  }
}