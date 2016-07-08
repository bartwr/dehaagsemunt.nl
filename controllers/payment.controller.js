'use strict';

var settings = require('../config/settings');
var logger = require('winston');
var models = require('../models/index');
var Mollie = require('mollie-api-node');
var mollie = new Mollie.API.Client;
mollie.setApiKey(settings.mollie.apikey);

/**
 *
 * Create a new transaction
 *
 **/
exports.create = function(req,res) {
  logger.debug('Creating a new payment', req.body);
  // Save payment in db with status -in-progress
  var payment = {
    description: 'Inleg De Haagse Munt',
    amount: req.body.amount,
    status: 'concept',
    account_id: req.user.id
  };

  models.payment.create(payment).then(function(payment) {
    if (payment) {
      // Create the mollie call
      mollie.payments.create({
        amount: payment.dataValues.amount,
        description: 'Inleg De Haagse Munt: Order id: ' + payment.dataValues.id,
        redirectUrl: 'https://app.dehaagsemunt.nl/payments/'+ payment.dataValues.id
      }, function (payment) {
        logger.debug(payment);
        // handle the payment
        res.json(payment);
      });
    } else {
      return res.json(payment);
    }
  }).catch(function(error) {
    return res.json({status: 'error', errorMsg: error});
  });
};


/**
 *
 *
 *
 **/
exports.mollieHook = function(req,res) {
  logger.debug('Handling mollie webhook request.');

  mollie.payments.get(req.body.id, function(payment) {
    if (payment.error) {
      logger.debug(payment.error);
      return res.json(403);
    }
    logger.debug(payment);
    models.payment.updateAttributes({
      status: payment.status
    }).then(function(result) {
      logger.debug('update result', result);
      return res.json(result);
    }).error(function(error) {
      logger.warning(error);
      return res.json(403);
    });
  });
};
