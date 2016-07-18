'use strict';

var models = require('../models/index');
var logger = require('winston');


// Fetch the latest balance for an account
function getLatestBalance(id, cb){
  logger.debug('Fetching latest balance for account: ' + id);
  var models = require('../models/index');

  return models.balance.findOne({
    where: { account_id: id },
    order: 'created_at DESC'
  }).then(function(balance) {
    console.log(balance);
    cb(balance);
    return null;
  }).catch(function(error){
    logger.debug('error', error);
    return null;
  });
}


function subtractBalance(balance, amount) {

  // Make sure we are working with Numbers
  amount = Number(amount);
  // Setup working balances
  logger.debug('Start Subtract Balance.');
  balance = balance.reverse();
  logger.debug('reverse balance: ', balance);
  var changeBalance = [0,0,0,0,0,0];

  // traverse through each fundStep (oldest funds first) and transfer money
  for (var i=0; i<balance.length; i++) {
    var stepValue = Number(balance[ i]);
    logger.debug('stepvalue: ' + i + ': ' + stepValue);
    if (amount>0 && stepValue>0) {
      logger.debug('There are funds in this step! ');
      var removeValue = amount;
      // Only get out what's available
      if (removeValue > stepValue) {
        logger.debug('getting all funds in this step. ');
        removeValue = stepValue;
      }
      logger.debug('Going to remove ' + removeValue + ' from step ' + (i+1));
      // add amount to the newbalance for this step
      balance[ i] -= removeValue;
      // add to change balance
      changeBalance[ i] = removeValue;
      // subtract amount;
      amount -= removeValue;
      if (amount <= 0) {
        logger.debug('Total amount subtracted');
      }
    }
  }

  var result = {
    new: balance.reverse(),
    change: changeBalance.reverse()
  };

  return result;
}


// Add a specific amount from a balance.
function addBalance(amount_meta, change) {
  // TODO: Validate input;

  for (var i=0; i<amount_meta.length; i++) {
    amount_meta[ i] += Number(change[ i]);
  }

  return amount_meta;
}


// bump the steps for the change array
function bumpBalanceMeta(change) {
  change.unshift(0);
  change[ 5] += change[ 6];
  change.splice(5,1);

  return change;
}


// get the total of a balance array
function calculateTotal(amount_meta) {
  logger.debug('calculating total for ', amount_meta);
  // calculate total
  var total =0;
  for (var k=0; k<amount_meta.length; k++) {
    total += Number(amount_meta[ k]);
  }
  logger.debug('Total calculated: ', total);
  return total;
}


/***
 *
 * Handle transaction: Create new balances for sender and receiver.
 *
 **/
exports.handleTransaction = function(transaction_id, cb) {

  var models = require('../models/index');

  models.transaction.findById(transaction_id).then(function(transaction) {

    var transactionAmount = Number(transaction.dataValues.amount);

    // variables for from account
    var from_id = transaction.dataValues.from_id;
    var to_id = transaction.dataValues.to_id;
    // from balance: Array: [0,0,0,0,0,0]
    var fromBalance;
    // to balance: Array: [0,0,0,0,0,0]
    var toBalance;

    // TODO: Check if balance already exists for this transaction

    // check type of transaction
    var type;
    if (to_id && from_id) { type = 'transfer';  }
    else if (to_id)       { type = 'payment';   }
    else if (from_id)     { type = 'withdrawl'; }
    logger.debug('Transaction type: ' + type);

    // Get balance for sender
    logger.debug('Fetching latest balance for sender');
    getLatestBalance(from_id, function(balance) {
      // Parse the amount_values to an array, or create a zero array
      if (balance) {
        if (balance.dataValues) {
          if (balance.dataValues.amount_meta) {
            fromBalance = JSON.parse(balance.dataValues.amount_meta);
          }
        }
      } else {
        fromBalance = [0,0,0,0,0,0];
      }
      logger.debug('Latest balance for sender', fromBalance);

      logger.debug('Fetching latest balance for receiver');
      getLatestBalance(to_id, function(balance) {
        if (balance) {
          if (balance.dataValues) {
            if (balance.dataValues.amount_meta) {
              toBalance = JSON.parse(balance.dataValues.amount_meta);
            }
          }
        } else {
          toBalance = [0,0,0,0,0,0];
        }
        logger.debug('Latest to balance for receiver', toBalance);

        var changeBalance = [transactionAmount, 0,0,0,0,0];
        logger.debug('Going to change with this balance: ', changeBalance);

        // Array for bulkcreate of balances
        var newBalances = [];

        if (type === 'payment') {
          logger.debug('Handling payment');
          toBalance = addBalance(toBalance, changeBalance);
          newBalances.push({
            amount: calculateTotal(toBalance),
            amount_meta: JSON.stringify(toBalance),
            account_id: to_id,
            transaction_id: transaction_id
          });
        }

        // create new balances
        if (type==='transfer') {
          logger.debug('[transfer]: Handling transfer ');
          logger.debug('[transfer]: Handling FROM ');
          logger.debug('[transfer]: fromBalance before Subtraction: ', fromBalance);
          fromBalance = subtractBalance(fromBalance, transactionAmount);
          logger.debug('[transfer]: new fromBalance after Subtraction: ', fromBalance);
          changeBalance = fromBalance.change;
          logger.debug('[transfer]: changeBalance before bump: ', changeBalance);
          changeBalance = bumpBalanceMeta(changeBalance);
          logger.debug('[transfer]: changeBalance after bump, ', changeBalance);

          // Create new balance for sender
          var newBalance = {
            amount: calculateTotal(fromBalance.new),
            amount_meta: JSON.stringify(fromBalance.new),
            account_id: from_id,
            transaction_id: transaction_id
          };
          logger.debug('[transfer]: new balance added to list: ', newBalance);
          newBalances.push(newBalance);

          // Handle TO balance
          logger.debug('[transfer]: Handling TO ');
          logger.debug('Sending balances for adding: ', toBalance, changeBalance);
          toBalance = addBalance(toBalance, changeBalance);
          logger.debug('newToBalance', toBalance);

          // Create new balance for receiver
          newBalances.push({
            amount: calculateTotal(toBalance),
            amount_meta: JSON.stringify(toBalance),
            account_id: to_id,
            transaction_id: transaction_id
          });
        }

        logger.debug('Creating new balances in database: ');

        models.balance.bulkCreate(newBalances).then(function() {
          return models.balance.findAll();
        }).then(function(balances){
          cb(balances);
        });
      });
    });
  }).catch(function(error) {
    logger.debug(error);
  });
};



/**
 *
 *
 *
 **/
exports.index = function(req, res) {
  var Balance = require('../models/index').balance;
  console.log(Balance);
  Balance.findAll({
    where: {
      account_id: req.body.account_id
    }
  }).then(function(result){
    return res.json(result);
  }).catch(function(error) {
    return res.json(error);
  });
};


/**
 *
 *
 *
 **/
exports.show = function(req,res) {
  models.balance.findOne({
    where: {
      account_id: req.body.account_id
    }
  }).then(function(result){
    console.log('balance show result', result);
    return res.json(result);
  }).catch(function(error) {
    return res.json(error);
  });
};
