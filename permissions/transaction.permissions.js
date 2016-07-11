'use strict';

var models = require('../models/index');
var settings = require('../config/settings');
var logger = require('winston');


exports.canView = function(req,res,next) {

  // validate transaction_id
  next();
};


/**
 *
 *  Validate if logged in user can create a new transaction
 *
 **/
exports.canCreate = function(req,res,next) {

  // validate access.
  logger.debug('Check can create transaction');
  if (!req.jwt || !req.jwt.account_id) { return res.json({status:'error', msg: 'No valid Authentication token supplied. '}); }
  if (!req.user.id) { return res.json({ status: 'error', msg: 'No user found. '}); }

  // Check required parameters.
  if (!req.body.from_id)     { return res.json({status: 'error', msg: 'Missing parameter from_id'}); }
  if (!req.body.to_id)       { return res.json({status: 'error', msg: 'Missing parameter to_id'}); }
  if (!req.body.amount)      { return res.json({status: 'error', msg: 'Missing parameter amount'}); }
  if (!req.body.description) { return res.json({status: 'error', msg: 'Missing parameter description'}); }

  // Check if from_id is logged in user.
  if (parseInt(req.user.id) !== parseInt(req.body.from_id)) {
    return res.json({status: 'error', msg: 'From_id does not match account_id'});
  }

  // Check if to_id is not logged in user.
  if (parseInt(req.body.from_id) === parseInt(req.body.to_id)) {
    return res.json({status: 'error', msg: 'to_id equals account_id'});
  }

  // Validate types
  if (isNaN(parseFloat(req.body.amount).toFixed(2))) {
    return res.json({status: 'error', msg: 'Amount is not a decimal: ' + req.body.amount});
  }
  if (req.body.amount <= 0) {
    return res.json({status: 'error', msg: 'Amount should be greater than 0: ' + req.body.amount});
  }
  // Check for sufficient funds
  if (req.body.from_id) {
    models.balance.findOne({
      where: {
        account_id: parseInt(req.body.from_id)
      },
      order: 'created_at DESC'
    }).then(function(balance) {
      if (parseInt(balance.dataValues.amount) < parseFloat(req.body.amount).toFixed(2)) {
        return res.json({ status: 'error', msg: 'Not enough funds (max: ' + balance.dataValues.amount + ')' });
      } else {
        next();
      }
    }).catch(function(error) {
      return res.json({ status: 'error', msg: 'Error: ' + error });
    });
  } else {
    // All good
    logger.debug('User can create a transcation');
    next();
  }
};


/**
 *
 *  Validate if logged in user can update a new transaction
 *
 **/
exports.canUpdate = function(req,res,next) {

  next();
};


/**
 *
 *  Validate if logged in user can delete a new transaction
 *
 **/
exports.canDelete = function(req,res,next) {

  next();
};
