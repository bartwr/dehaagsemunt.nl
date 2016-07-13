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
  logger.debug('Starting to create a new payment.');
  console.log(req.body);

  // Save payment in db with status -in-progress
  var payment = {
    description: 'Inleg De Haagse Munt',
    amount: Number(req.body.payment).toFixed(2),
    costs: Number(req.body.costs).toFixed(2),
    status: 'concept',
    account_id: req.user.id
  };
  console.log('Creating new payment: ', payment);

  models.payment.create(payment).then(function(payment) {
    console.log(payment.dataValues);
    if (payment) {
      logger.debug('sending payment to mollie.');
      var molliePayment = {
        amount: Number(payment.dataValues.amount) + Number(payment.dataValues.costs),
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
  var mollie_id = req.body.id;      // Mollie payment id (stored in local db).
  var payment_id;                   // Local db payment.id.
  var molliePayment, localPayment;  // Reference to the two payments.
  var mollieStatus, localStatus;    // Reference to the two stored payment statuses.

  // Fetch the payment from mollie with the provided mollie_id
  mollie.payments.get(mollie_id, function(molliePayment) {
    console.log(molliePayment);
    mollieStatus = String(molliePayment.status);
    // Handle payment errors
    if (molliePayment.error) {
      logger.debug('There was an error! ', molliePayment.error);
      return res.status(403).json(molliePayment.error);
    }

    // fetch the localPayment from database
    models.payment.findOne({ where: {
      mollie_id: mollie_id
    }}).then(function(payment) {
      if (!payment) {
        logger.debug('The requested payment was not found! ' + mollie_id );
        return res.status(403).json({msg: 'Payment not found! '});
      }
      // logger.debug('Local payment found: ', payment);
      localStatus = String(payment.status);
      logger.debug('Updating status: ' + localStatus + ' to: ' + mollieStatus);
      // Update the payment status in the db
      payment.update({
        status: mollieStatus,
        mollie_details: JSON.stringify(molliePayment)
      }).then(function(result) {
        // Payment is received.
        console.log('payment update result');

        return res.json({ status: 'success' });
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
