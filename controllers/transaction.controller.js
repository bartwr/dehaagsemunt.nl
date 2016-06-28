'use strict';

var models = require('../models/index');
var request = require('request');


exports.index = function(req,res) {
  console.log('Transaction index. ');
  models.transaction.findAll({
    where: {
      $or: [
        { from_id: req.query.account_id },
        { to_id: req.query.account_id }
      ]
    }
  }).then(function(result){
    return res.json(result);
  }).catch(function(error){
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
  console.log('Create transaction. ');
  models.transaction.create(req.body).then(function(result) {
    console.log(result);
    return res.json(result);
  }).catch(function(error) {
    return res.json(error);
  });
};

exports.update = function(req,res) {

};

exports.destroy = function(req,res) {

};
