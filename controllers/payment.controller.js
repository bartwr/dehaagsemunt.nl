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
      // Create the mollie call
      mollie.payments.create(molliePayment, function (newPayment) {
        logger.debug('Payment received by Mollie: ', newPayment);
        // handle the payment
        // Add the mollie data to the database payment
        payment.update({
          status: newPayment.status,
          mollie_id: newPayment.id,
          mollie_details: JSON.stringify(newPayment)
        }).then(function(result) {
          return res.json(newPayment);
        }).catch(function(error) {
          return res.json(error);
        });
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
  console.log(mollie);
  mollie.payments.get(req.body.id, function(molliePayment) {
    logger.debug('Mollie payment request result: ', molliePayment);

    // Handle payment errors
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


    logger.debug('Finding payment in local payment db: ' + molliePayment.metadata.payment_id);
    // fetch the saved payment in db
    models.payment.findById(molliePayment.metadata.payment_id).then(function(payment){
      if (!payment) {
        logger.debug('Payment not found! ');
        return;
      }
      logger.debug('Local payment found: ', payment);
      logger.debug('Updating status: ' + molliePayment.status);
      // Update the payment status in the db
      payment.update({status: molliePayment.status}).then(function(result) {
        logger.debug('Payment update status result: ', result);
        // Handle payment update
        // New payment. Create a new transaction when a new payment is received.
        if ( (payment.dataValues.status !== 'paid') && (molliePayment.status==='paid') ) {
          // TODO: update balance
          logger.debug('Payment received. Creating transaction. ');
          models.transaction.create({
            type: 'B',
            amount: molliePayment.amount,
            amount_meta: '[' + molliePayment.amount + ',0,0,0,0,0]',
            to_id: req.user.id,
            description: 'Inleg. Payment ' + payment.dataValues.id
          }).then(function(transaction) {
            console.log(transaction);
            payment.update({
              transaction_id: transaction.dataValues.id
            }).then(function(result) {
              console.log(result);
            }).catch(function(error) {
              console.log(error);
            });
          }).catch(function(error) {
            console.log(error);
          })
          // TODO: Send a mail with the status update.

        } else {
          // TODO: Send a mail with the status update.

        }

        return res.json(result);
      }).catch(function(error) {
        return res.json(error);
      });
    }).catch(function(error) {
      return res.json(error);
    });
  });
};
