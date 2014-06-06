/**
 * User Model Definition
**/
module.exports = function(db) {
  
  var User = db.define('user', {
    number        : { type: 'text', size: 100, required: true },
    status        : { type: 'text', size: 40, defaultValue: 'INACTIVE'},
    rtc_id        : { type: 'text', size: 100 },
    otp_code      : { type: 'text', size: 100 },
    expired       : { type: 'date', time: true },
    code          : { type: 'text', size: 500 }
  }, {
    methods: {
      computeExpiryDate: function(dateObj) {
        var that = this;

        var durationConfig = {};

        var addYear = durationConfig.year || 0,
            addMonth = durationConfig.month || 0,
            addDay = durationConfig.day || 0,
            addHours = durationConfig.hour || 1;


        dateObj.setUTCFullYear(parseInt(dateObj.getUTCFullYear()) + parseInt(addYear));
        dateObj.setMonth(parseInt(dateObj.getMonth()) + parseInt(addMonth));
        dateObj.setDate(parseInt(dateObj.getDate()) + parseInt(addDay));
        dateObj.setHours(parseInt(dateObj.getHours()) + parseInt(addHours));

        return dateObj;
      }
    }
  });
  
  // create table
  User.sync(function(err) {
  
  });
  

  User.generateOTPCode = function(number) {

    var codeLength = 8;
    var crypto = require('crypto');
    
    // get the salt to a config OR create a salt per user
    var salt = 'c8c70862174ddbcfcf82269a4497e292f0e408bb';
    
    var d = new Date();

    var cipherSubject = number + d.toUTCString();

    // encrypt password using crypto module (http://nodejs.org/api/crypto.html)
    var cipher = crypto.createCipher('aes-256-cbc', salt);
    var activationCode = cipher.update(cipherSubject, 'utf8', 'hex') + cipher.final('hex');

    // substring the code if it exceeds the maxLength
    // if (activationCode.length > codeLength) {
    //   activationCode = activationCode.substring(90, maxCodeLength);
    // }

    var genCodeLength = activationCode.length;
    activationCode.substring(genCodeLength - 10, genCodeLength); 
 
    return activationCode; 
  }
  
  return User;
}
