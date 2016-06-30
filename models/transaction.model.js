'use strict';

var logger = require('winston');

module.exports = function(sequelize, DataTypes) {


  // remove a specific amount from a balance.
  function subtractBalance(balance, amount, cb) {
    // Make sure we are working with integers
    amount = parseInt(amount);
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

    // calculate total
    var total =0;
    for (var k=0; k<reverseBalance.length; k++) {
      total += reverseBalance[ k];
    }
    var result = {
      new: newBalance.reverse(),
      change: changeBalance.reverse(),
      amount: parseInt(total)
    };

    logger.debug('Returning new balance: ', result);
    cb(result);
  }


  // Add a specific amount from a balance.
  function addBalance(balance, change, cb) {
    logger.debug('--- addbalance ---');
    logger.debug(balance);
    logger.debug(change);

    // bump the steps for the change array
    change.unshift(0);
    change[ 5] += change[ 6];
    change.splice(5,1);
    logger.debug('bumped change: ', change);

    var oldBalance = JSON.parse(balance);
    var newBalance = oldBalance;

    logger.debug('old balance: ', oldBalance);

    for (var i=0; i<newBalance.length; i++) {
      newBalance[ i] += parseInt(change[ i]);
    }

    logger.debug('Returning new balance: ', newBalance);

    // calculate total
    var total =0;
    for (var k=0; k<newBalance.length; k++) {
      total += newBalance[ k];
    }
    var result = {
      new: newBalance,
      amount: parseInt(total)
    };

    cb(result);
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

        Transaction.hasMany(models.balance, {
          as: 'balance'
        });
      }
    }
  });

  Transaction.addHook('afterCreate', 'updateBalance', function(transaction, options) {

    var models = require('../models/index');

    var toId = transaction.dataValues.to_id;
    var fromId = transaction.dataValues.from_id;
    var transactionAmount = parseInt(transaction.dataValues.amount);

    // Update the balances for this transaction
    logger.debug('Transaction created, updating balance. ');

    // Check if is overboeking
    if (toId && fromId) {
      logger.debug('Handling Overboeking');
      // get latest balance for user
      models.balance.findOne({
        where: { account_id: fromId },
        order: 'created_at DESC'
      }).then(function(balance) {
        logger.debug('Balance found for from account: ', balance.dataValues);
        // update balance for from-account (subtract)
        subtractBalance(balance.dataValues, transactionAmount, function(balance) {
          logger.debug('New balance after subtraction: ', balance);
          console.log(balance);

          var changeBalance = balance.change;

          models.balance.create({
            amount: balance.amount,
            amount_meta: JSON.stringify(balance.new),
            account_id: fromId,
            transaction_id: transaction.id
          }).then(function(result) {
            logger.debug('New balance created for fromAccount');

            // Add balance to toAccount
            models.balance.findOne({
              where: { account_id: transaction.dataValues.to_id },
              order: 'created_at DESC'
            }).then(function(balance) {
              logger.debug('Balance found for to account: ', balance.dataValues);
              addBalance(balance.dataValues.amount_meta, changeBalance, function(result) {
                logger.debug('Add function result: ', result);
                models.balance.create({
                  amount: result.amount,
                  amount_meta: JSON.stringify(result.new),
                  account_id: toId,
                  transaction_id: transaction.id
                }).then(function(result) {
                  logger.debug(result);

                }).catch(function(error) {
                  logger.debug(error);
                  
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

    // Check if is inleg
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

    // Check if is opname
    } else if (transaction.dataValues.from_id) {
      logger.debug('Handling Withdrawl');


    // wrong transaction
    } else {
      logger.debug('No valid accounts found for this transaction. ');
    }
  });

  return Transaction;
};
