'use strict';

var logger = require('winston');

module.exports = function(sequelize, DataTypes) {


  // remove a specific amount from a balance.
  function subtractBalance(balance, amount, cb) {
    // Make sure we are working with integers
    amount=parseInt(amount);
    logger.debug('subtract amount: ' + amount);
    logger.debug('amount_meta: ', balance.amount_meta);

    // Setup working balances
    var newBalance = JSON.parse(balance.amount_meta);
    logger.debug('amount meta: ' + newBalance);
    var reverseBalance = newBalance.reverse();
    logger.debug('reverse balance: ', reverseBalance);
    var changeBalance = [0,0,0,0,0,0];

    // traverse through each fundStep (oldest funds first) and transfer money
    for (var i=0; i<reverseBalance.length; i++) {
      var stepValue = parseInt(newBalance[ i]);
      logger.debug('stepvalue: ' + i + ': ' + stepValue);
      if (amount>0 && stepValue>0) {
        logger.debug('There are funds in this step! ');
        var removeValue = amount;
        // Only get out what's available
        if (removeValue > stepValue) {
          logger.debug('getting all funds in this step. ');
          removeValue = stepValue;
        }
        logger.debug('Going to remove ' + removeValue + ' from step ' + i);
        // add amount to the newbalance for this step
        newBalance[ i] -= removeValue;
        // add to change balance
        changeBalance[ i] = removeValue;

        // subtract amount;
        amount -= removeValue;
        if (amount >= 0) {
          logger.debug('Total amount subtracted');
        }
      }
    }

    newBalance = newBalance.reverse();
    changeBalance = changeBalance.reverse();
    logger.debug('Sending new balance: ' + newBalance);
    cb({change: changeBalance, new: newBalance});
  }


  // remove a specific amount from a balance.
  function addBalance(balance, change, cb) {

    var oldBalance = JSON.parse(balance);
    var newBalance = oldBalance;

    for (var i=0; i<newBalance.length; i++) {
      newBalance[ i] += parseInt(change[ i]);
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

    logger.debug('Transaction created, updating balance. ');
    if (transaction.dataValues.to_id && transaction.dataValues.from_id) {
      logger.debug('Handling Overboeking');
      // get latest balance for user
      models.balance.findOne({
        where: {
          account_id: transaction.dataValues.from_id
        }
      }).then(function(balance) {

        // create balance steps to be removed and added.

        //
        subtractBalance(balance.dataValues, transaction.dataValues.amount, function(result) {
          logger.debug('Subtract function result: ', result);
          var changeBalance = result.change;
          logger.debug('change', changeBalance);

          models.balance.create({
            amount: balance.dataValues.amount - transaction.dataValues.amount,
            amount_meta: JSON.stringify(result.new),
            account_id: transaction.dataValues.from_id
          }).then(function(result) {
            logger.debug('New balance created for fromAccount');


            // Add balance to toAccount
            models.balance.findOne({
              where: { account_id: transaction.dataValues.to_id }
            }).then(function(balance) {
              addBalance(balance.dataValues.amount_meta, changeBalance, function(result) {
                logger.debug('Add function result: ', result);
                models.balance.create({
                  amount: balance.dataValues.amount + transaction.dataValues.amount,
                  amount_meta: JSON.stringify(result),
                  account_id: transaction.dataValues.to_id
                });
              });
            }).catch(function(error) {
              logger.debug(error);
            });
          }).catch(function(error) {
            logger.debug(error);
          });
        });
      }).catch(function(error) {
        logger.debug(error);
      });

    } else if (transaction.dataValues.to_id) {
      logger.debug('Handling Deposit');
      // get latest balance for this account
      models.balance.findOne({
        where: {
          account_id: transaction.dataValues.to_id
        }
      }).then(function(result) {
        if (!result) {
          logger.debug('No balance yet. Creating new balance');
          models.balance.create({
            amount: transaction.dataValues.amount,
            amount_meta: '['+transaction.dataValues.amount+',0,0,0,0,0]',
            account_id: transaction.dataValues.to_id
          }).then(function(result) {
            logger.debug('Balance created: ', result.dataValues.amount);

          }).catch(function(error){
            logger.debug(error);
          });
        } else {
          logger.debug('Updating current balance');

        }
      }).catch(function(error){
        logger.debug(error);
        return;
      });

    } else if (transaction.dataValues.from_id) {
      logger.debug('Handling Withdrawl');


    } else {
      logger.debug('No valid accounts found for this transaction. ');
    }
  });

  return Transaction;
};
