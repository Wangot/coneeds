/**
 * User Credits History Definition
**/
module.exports = function(db) {

  db.defineType('int', { 
    datastoreType: function(prop) {
      return 'int(11)';
    }
  });

  db.defineType('myBigint', { 
    datastoreType: function(prop) {
      return 'BIGINT';
    }
  });


  var CreditsHistory = db.define('credits_history', {
    reference_code  : { type: 'myBigint' },
    action          : { type: 'text', size: 40 },
    amount          : { type: 'int' },
    user_id         : { type: 'int' },
    balance         : { type: 'int'},
    created         : { type: 'date', time: true }
  }, {
    hooks : {
      beforeCreate : function() {
        var that = this;
        that.created = new Date();
      }
    }
  });

  CreditsHistory.sync(function(err,data) {
    
  });

  var baseEntry = '11391000010';
  var refCodeIncrement = 1;

  CreditsHistory.getLastRefCode = function(_callback) {

    var query = "SELECT `reference_code` FROM `credits_history` ORDER BY `created` DESC LIMIT 1";

    db.driver.execQuery(query, function(err, queryResult){

      var lastRefCode = baseEntry;
      if (queryResult.length == 1) {
        lastRefCode = queryResult[0].reference_code.toString();
      }

      _callback(err, lastRefCode);
    });

  };

  CreditsHistory.getLatestHistory = function(userId, _callback) {

    CreditsHistory.find({user_id: userId}, ["created", "Z"], 1, function(err, historyItem) {
      var resultingItem;

      if (historyItem.length == 1) {
        resultingItem = historyItem[0];
      }

      _callback(err, resultingItem);
    });

  };

  CreditsHistory.consume = function(userId, seconds, _callback) {
    var secondsPerCredit = 10;

    var consumedValue = Math.ceil(seconds / secondsPerCredit);

    var actualAmount = 0 - consumedValue;

    CreditsHistory.createEntry('consume', actualAmount, userId, _callback);

  };

  CreditsHistory.createEntry = function(action, amount, userId, _callback) {
    
    CreditsHistory.getLatestHistory(userId, function(err, historyItem) {
      if (err) {
        _callback(err);
      } else {

        var refCode = baseEntry;
        var balance = amount;

        if (historyItem) {
          refCode = parseInt(historyItem.reference_code) + refCodeIncrement;
          balance = parseInt(historyItem.balance) + amount;
        }

        var createHistory = [{
          reference_code  : refCode,
          action          : action,
          amount          : amount,
          user_id         : userId,
          balance         : balance
        }];

        CreditsHistory.create(createHistory, function(err, items) {
          if (err) {
            _callback(err);
          } else {
            _callback(null, items[0]);
          }
        });

      }
    });

  };


  return CreditsHistory;

};