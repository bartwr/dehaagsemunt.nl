'use strict';

var models = require('../models/index');
var settings = require('../config/settings');
var logger = require('winston');

exports.canView = function(req,res,next) {
  logger.debug('Validating permission: index payments.');
  // Only logged in users
  if (!req.jwt || !req.jwt.account_id) { return res.json({status:'error', msg: 'No valid Authentication token supplied.'}); }
  if (!req.user.id) { return res.json({ status: 'error', msg: 'No user found. '}); }

  // all good
  logger.debug('User can index payments');
  next();
};

exports.canCreate = function(req,res,next) {
  // validate access.
  logger.debug('Check can create payment. ');
  if (!req.jwt || !req.jwt.account_id) { return res.json({status:'error', msg: 'No valid Authentication token supplied. '}); }
  if (!req.user.id) { return res.json({ status: 'error', msg: 'No user found. '}); }

  // Check required parameters.
  if (!req.body.amount)      { return res.json({status: 'error', msg: 'Missing parameter amount'}); }

  // Validate types
  if (isNaN(parseInt(req.body.amount))) {
    return res.json({status: 'error', msg: 'Amount is not a number: ' + req.body.amount});
  }
  if (req.body.amount <= 0) {
    return res.json({status: 'error', msg: 'Amount should be greater than 0: ' + req.body.amount});
  }
  // All good
  logger.debug('User can create a transcation');
  next();
};


exports.canUpdate = function(req,res,next) {
  console.log('Check can update.');
  next();
};

exports.canDelete = function(req,res,next) {
  console.log('Check can delete.');
  next();
};
