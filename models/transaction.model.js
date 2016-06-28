'use strict';

module.exports = function(sequelize, DataTypes) {


  // remove a specific amount from a balance.
  function subtractBalance(balance, amount, cb) {

    console.log('subtract amount: ' + amount);
    console.log('amount_meta: ', balance.amount_meta);
    console.log(typeof(balance.amount_meta));
    var newBalance = JSON.parse(balance.amount_meta);
    console.log('amount meta: ' + newBalance);
    var reverseBalance = newBalance.reverse();
    console.log('reverse balance: ', reverseBalance);
    var changeBalance = [0,0,0,0,0,0];

    // traverse through each fundStep (oldest funds first) and transfer money
    for (var i=0; i<reverseBalance.length; i++) {
      var stepValue = parseInt(newBalance[ i]);
      console.log('stepvalue: ' + i + ': ' + stepValue);
      if (amount>0 && stepValue>0) {
        console.log('There are funds in this step! ');
        var removeValue = amount;
        // Only get out what's available
        if (removeValue > stepValue) {
          console.log('getting all funds in this step. ');
          removeValue = stepValue;
        }
        console.log('Going to remove ' + removeValue + ' from step ' + i);
        // add amount to the newbalance for this step
        newBalance[ i] -= removeValue;
        // add to change balance
        changeBalance[ i] = removeValue;

        // subtract amount;
        amount -= removeValue;
        if (amount >= 0) {
          console.log('Total amount subtracted');
        }
      }
    }
    newBalance = newBalance.reverse();
    changeBalance = changeBalance.reverse();
    console.log('Sending new balance: ' + newBalance);
    cb({change: changeBalance, new: newBalance});
  }


  // remove a specific amount from a balance.
  function addBalance(balance, change, cb) {

    var oldBalance = JSON.parse(balance);
    var newBalance = oldBalance;

    for (var i=0; i<newBalance.length; i++) {
      newBalance[ i] += change[ i];
    }

    cb(newBalance);
  }


  var Transaction = sequelize.define('transaction', {

    type: {
      type: DataTypes.STRING,
      defaultValue: 'ob'
    },

    description: DataTypes.STRING,

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {

        Transaction.belongsTo(models.account, {
          as: 'sender',
          foreignKey: 'from_id'
        });

        Transaction.belongsTo(models.account, {
          as: 'recipient',
          foreignKey: 'to_id'
        });

      }
    }
  });

  Transaction.addHook('afterCreate', 'updateBalance', function(transaction, options) {

    var models = require('../models/index');

    console.log('Transaction created, updating balance. ');
    if (transaction.dataValues.to_id && transaction.dataValues.from_id) {
      console.log('Handling Overboeking');
      // get latest balance for user
      models.balance.findOne({
        where: {
          account_id: transaction.dataValues.from_id
        }
      }).then(function(balance) {

        // create balance steps to be removed and added.

        //
        subtractBalance(balance.dataValues, transaction.dataValues.amount, function(result) {
          console.log('Subtract function result: ', result);
          var changeBalance = result.change;
          console.log('change', changeBalance);

          models.balance.create({
            amount: balance.dataValues.amount - transaction.dataValues.amount,
            amount_meta: JSON.stringify(result.new),
            account_id: transaction.dataValues.from_id
          }).then(function(result) {
            console.log('New balance created for fromAccount');


            // Add balance to toAccount
            models.balance.findOne({
              where: { account_id: transaction.dataValues.to_id }
            }).then(function(balance) {
              addBalance(balance.dataValues.amount_meta, changeBalance, function(result) {
                console.log('Add function result: ', result);
                models.balance.create({
                  amount: balance.dataValues.amount + transaction.dataValues.amount,
                  amount_meta: JSON.stringify(result),
                  account_id: transaction.dataValues.to_id
                })
              });
            }).catch(function(error) {
              console.log(error);
            });
          }).catch(function(error) {
            console.log(error);
          });
        })
      }).catch(function(error) {
        console.log(error);
      });

    } else if (transaction.dataValues.to_id) {
      console.log('Handling Deposit');
      // get latest balance for this account
      models.balance.findOne({
        where: {
          account_id: transaction.dataValues.to_id
        }
      }).then(function(result) {
        if (!result) {
          console.log('No balance yet. Creating new balance');
          models.balance.create({
            amount: transaction.dataValues.amount,
            amount_meta: '['+transaction.dataValues.amount+',0,0,0,0,0]',
            account_id: transaction.dataValues.to_id
          }).then(function(result) {
            console.log('Balance created: ', result.dataValues.amount);

          }).catch(function(error){
            console.log(error);
          });
        } else {
          console.log('Updating current balance');

        }
      }).catch(function(error){
        console.log(error);
        return;
      });;

    } else if (transaction.dataValues.from_id) {
      console.log('Handling Withdrawl');


    } else {
      console.log('No valid accounts found for this transaction. ');
    }
  });

  return Transaction;
};
