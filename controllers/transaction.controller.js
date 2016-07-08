'use strict';

var logger = require('winston');
var models = require('../models/index');
var request = require('request');
var balanceCtrl = require('../controllers/balance.controller');


/**
 *
 * Show a list of existing transactions
 *
 **/
exports.index = function(req,res) {
  console.log('Transaction index. ');
  models.transaction.findAll({
    where: {
      $or: [
        { from_id: req.query.account_id },
        { to_id: req.query.account_id }
      ]
    },
    include: [
      { model: models.account, foreignKey: 'to_id', as: 'recipient'},
      { model: models.account, foreignKey: 'from_id', as: 'sender'}
    ],
  }).then(function(result) {
    return res.json(result);
  }).catch(function(error){
    console.log(error);
    return res.json(error);
  });
};


/**
 *
 * Show an existing transaction
 *
 **/
exports.show = function(req,res) {

  console.log('Transaction show. ');
  // get transaction based on voOot-transaction-id;
  models.transaction.find({
    where: {
      id: req.params.id
    },
    // include: [
    //   { model: models.transactionitems, as: 'items' }
    // ]

  }).then(function(result){
    logger.debug(result);
    return res.json(result);
  }).catch(function(error){
    return res.json(error);
  });
};


/**
 *
 * Create a new transaction
 *
 **/
exports.create = function(req,res) {
  logger.debug('Creating a new transaction. ');

  // Create the transaction.
  models.transaction.create(req.body).then(function(transaction) {
    // Update the balances after this transaction.
    if (!transaction) { return res.json({status: 'error', msg: 'No transaction created. '}); }

    balanceCtrl.handleTransaction(transaction.dataValues.id, function(result) {
      // TODO: Check if balances are handled correctly

      // All done, send the saved transaction back.
      return res.json(transaction);
    });
  }).catch(function(error) {
    return res.json({status: 'error', msg: error });
  });
};


/**
 *
 * Update an existing transaction
 *
 **/
exports.update = function(req,res) {

};


/**
 *
 * Delete an existing transaction
 *
 **/
exports.destroy = function(req,res) {

};
