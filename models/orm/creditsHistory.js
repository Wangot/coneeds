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

  CreditsHistory.getLatestHistory = function(userId, _callback) {

    CreditsHistory.find({user_id: userId}, ["created", "Z"], 1, function(err, historyItem) {
      var resultingItem;

      if (historyItem.length == 1) {
        resultingItem = historyItem[0];
      }

      _callback(err, resultingItem);
    });

  };

  CreditsHistory.createEntry = function(action, amount, userId, _callback) {
    var baseEntry = 11391000003;
    var refCodeIncrement = 1;

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

        // console.log(refCode);
        // console.log(balance);
        // console.log(amount);

        var createHistory = [{
          reference_code  : refCode,
          action          : action,
          amount          : amount,
          user_id         : userId,
          balance         : balance
        }];
        // console.log(createHistory);

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