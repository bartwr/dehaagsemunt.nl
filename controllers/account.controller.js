'use strict';

var models = require('../models/index');


exports.index = function(req,res) {
  console.log('Account Controller: Account index');
  console.log(req.user);
  // exclude current user

  models.account.findAll({
    where: {
      id: {
        $ne: req.user.id
      }
    }
  }).then(function(result){
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
    include: [
      { model: models.account, as:'contact', through: 'account_contacts' }
    ]
  }).then(function(result){
    return res.json(result);
  }).catch(function(error){
    return res.json(error);
  });
};


exports.create = function(req,res) { };


exports.update = function(req,res) { };


exports.destroy = function(req,res) { };


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

exports.search = function(req,res) {
  var q = req.body.query;
  if (!q) { return res.json({status: 'error', msg: 'No query found. '}); }

  console.log('Searching for username: ', q);
  models.account.findAll({
    where: {
      username: { like: '%' + q + '%' },
      id: {
        $ne: req.user.id
      }
    }
  }).then(function(result){
    return res.json(result);
  }).catch(function(error){
    return res.json(error);
  });
};
