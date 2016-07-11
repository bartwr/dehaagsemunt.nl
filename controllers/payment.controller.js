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
  logger.debug('Creating a new payment');
  console.log(req.user);
  // Save payment in db with status -in-progress
  var payment = {
    description: 'Inleg De Haagse Munt',
    amount: req.body.amount,
    status: 'concept',
    account_id: req.user.id
  };
  console.log(payment);

  models.payment.create(payment).then(function(payment) {
    console.log(payment.dataValues);
    if (payment) {
      logger.debug('sending payment to mollie.');
      var molliePayment = {
        amount: payment.dataValues.amount,
        description: 'Inleg De Haagse Munt: Order id: ' + payment.dataValues.id,
        redirectUrl: 'https://app.dehaagsemunt.nl/payments/'+ payment.dataValues.id,
        metadata: {
          payment_id: payment.dataValues.id
        }
      };
      console.log('m');
      console.log(molliePayment);
      // Create the mollie call
      mollie.payments.create(molliePayment, function (payment) {
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



exports.index = function(req, res) {
  console.log('Paymentservice index');
  models.payment.findAll({where: {
    account_id: req.user.id
  }}).then(function(payments){
    return res.json(payments);
  }).catch(function(error) {
    return res.json([error]);
  });
};


/**
 *
 *
 *
 **/
exports.mollieHook = function(req,res) {
  logger.debug('Handling mollie webhook request.');

  mollie.payments.get(req.body.id, function(molliePayment) {
    if (molliePayment.error) {
      logger.debug(molliePayment.error);
      return res.json(403, molliePayment.error);
    }
    if (!molliePayment.id) {
      return res.json(403, {msg: 'payment not found', payment: molliePayment});
    }
    if (!molliePayment.metadata && !molliePayment.metadata.payment_id) {
      return res.json(403, {msg: 'payment has no payment_id', payment: molliePayment});
    }

    console.log(molliePayment);
    // fetch the saved payment in db
    models.payment.findById(molliePayment.metadata.payment_id).then(function(payment){
      if (!payment) { return payment; }

      // Check for status update
      if ( (payment.dataValues.status !== 'paid') && (molliePayment.status==='paid') ) {
        // TODO: update balance

      }
      // Update the payment status
      payment.update({status: molliePayment.status}).then(function(result) {
        return res.json(result);
      }).catch(function(error) {
        return res.json(error);
      });

      // TODO: Send a mail with the status update.

    }).catch(function(error) {
      return res.json(error);
    });
  });
};
