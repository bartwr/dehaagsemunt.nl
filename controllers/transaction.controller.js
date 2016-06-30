'use strict';

var logger = require('winston');
var models = require('../models/index');
var request = require('request');
var balanceCtrl = require('../controllers/balance.controller');

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
    console.log(result);
    return res.json(result);
  }).catch(function(error){
    return res.json(error);
  });
};

exports.create = function(req,res) {
  logger.debug('Create transaction. ');
  models.transaction.create(req.body).then(function(transaction) {
    // logger.debug(transaction);
    if (transaction) {
      balanceCtrl.handleTransaction(transaction.dataValues.id);
    }
    return res.json(transaction);
  }).catch(function(error) {
    return res.json(error);
  });
};

exports.update = function(req,res) {

};

exports.destroy = function(req,res) {

};
