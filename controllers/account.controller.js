'use strict';

var models = require('../models/index');


exports.index = function(req,res) {
  console.log('Account Controller: Account index');
  models.account.findAll().then(function(result){
    return res.json(result);
  }).catch(function(error){
    return res.json(error);
  });
};


exports.show = function(req,res) {
console.log('Account Controller: Account show: ' + req.params.id);
  models.account.findOne({
    where: {
      id: req.params.id
    },
  }).then(function(result){
    return res.json(result);
  }).catch(function(error){
    return res.json(error);
  });
};

exports.create = function(req,res) {

};

exports.update = function(req,res) {

};

exports.destroy = function(req,res) {

};

exports.showBalance = function(req,res) {
  models.balance.findOne({
    where: {
      account_id: req.params.id
    },
    order: 'created_at DESC'
  }).then(function(balance) {
    return res.json(balance);
  });
};
