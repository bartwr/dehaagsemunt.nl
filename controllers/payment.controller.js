'use strict';

var settings = require('../config/settings');
var logger = require('winston');
var models = require('../models/index');
var balanceCtrl = require('./balance.controller');
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
 *  Get payment from mollie (molliePayment)
 *  Get payment from database (localPayment)
 *  Update localPayment with fetched molliePayment
 *
 *
 *
 **/
exports.mollieHook = function(req,res) {

  logger.debug('*** Mollie Hook *** ');
  // logger.debug('Fetching payment from mollie: ' + req.body.id);
  var mollie_id = req.body.id;
  var payment_id;
  var molliePayment, localPayment;
  var mollieStatus, localStatus;

  mollie.payments.get(mollie_id, function(molliePayment) {
    // logger.debug('Mollie payment request result: ');
    payment_id = parseInt(molliePayment.metadata.payment_id);
    mollieStatus = String(molliePayment.status);
    // Handle payment errors
    if (molliePayment.error) {
      logger.debug('There was an error! ', molliePayment.error);
      return res.status(403).json(molliePayment.error);
    }

    // fetch the localPayment from database
    // logger.debug('Finding payment in local payment db: ' + parseInt(molliePayment.metadata.payment_id));
    models.payment.findById(payment_id).then(function(payment) {
      if (!payment) {
        logger.debug('Payment not found! ');
        return res.status(403).json({msg: 'Payment not found! '});
      }
      // logger.debug('Local payment found: ', payment);
      localStatus = String(payment.status);
      logger.debug('Updating status: ' + mollieStatus + ' to: ' + localStatus);
      // Update the payment status in the db
      payment.update({status: mollieStatus}).then(function(result) {
        // New payment. Create a new transaction when a new payment is received.
        if ( (localStatus !== 'paid') && (mollieStatus==='paid') ) {
          // TODO: update balance
          logger.debug('Payment received. Creating transaction. ');
          console.log(payment.dataValues);
          var t = {
            type: 'B',
            amount: molliePayment.amount,
            amount_meta: '[' + molliePayment.amount + ',0,0,0,0,0]',
            to_id: payment.dataValues.account_id,
            description: 'Inleg door user. Payment nummer: ' + payment.dataValues.id
          };
          console.log('new transaction, ', t);

          // Create new transaction based on payment.
          models.transaction.create(t).then(function(transaction) {
            // Update balance after a succesful transaction.
            // TODO: Hook into model?
            balanceCtrl.handleTransaction(transaction.dataValues.id, function(result) {
              console.log(result);
              // console.log(result);
              payment.update({transaction_id: transaction.dataValues.id}).then(function(result) {
                console.log('payment update resutl: ', result);
                // Send positive response to Mollie
                return res.status(200);
              }).catch(function(error) {
                logger.warning(error);
                return res.status(403).json(error);
              });
            });
          });
          // TODO: Send a mail with the status update.

        } else {
          // TODO: Send a mail with the status update.
          console.log('No paid result status: ', molliePayment);
          return res.json(molliePayment);
        }
      }).catch(function(error) {
        console.log('molliehook update status error: ', error);
        return res.json(error);
      });
    }).catch(function(error) {
      console.log('molliehook findbyID error: ', error);
      return res.json(error);
    });
  });
};
