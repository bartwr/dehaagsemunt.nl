'use strict';

var logger = require('winston');
var models = require('./index');

module.exports = function(sequelize, DataTypes) {

  var Payment = sequelize.define('payment', {

    description: DataTypes.STRING,

    // Payment funds
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    // payment costs
    costs: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: 'concept'
    },

    mollie_id: {
      type: DataTypes.STRING
    },
    mollie_details: {
      type: DataTypes.TEXT
    }

  }, {
    classMethods: {
      associate: function(models) {

        Payment.belongsTo(models.account, {
          as: 'account',
          foreignKey: 'account_id'
        });

        Payment.belongsTo(models.transaction, {
          as: 'transaction',
          foreignKey: 'transaction_id'
        });

      }
    }
  });


  // Create the transaction after receiving a valid payment.
  Payment.afterUpdate('createTransaction', function(payment, options) {
    logger.debug('Payment updated. Start creating the transaction if needed');
    var oldStatus = payment._previousDataValues.status;
    var newStatus = payment.dataValues.status;
    logger.debug(oldStatus);
    logger.debug(newStatus);

    if ( (oldStatus!==newStatus) && (newStatus==='paid') ) {

      // Send an email to user with payment received message
      // emailService.send({
      //   type: 'paymentReceived',
      //   total: Number(payment.dataValues.amount) + Number(payment.dataValues.costs)
      // });

      logger.debug('Payment received! Create the new transaction. ');
      var t = {
        type: 'B',
        amount: Number(payment.dataValues.amount).toFixed(2),
        amount_meta: '[' + Number(payment.dataValues.amount).toFixed(2) + ',0,0,0,0,0]',
        to_id: payment.dataValues.account_id,
        description: 'Inleg door gebruiker. Payment nummer: ' + payment.dataValues.id
      };
      console.log('New transaction, ', t);
      var models = require('./index');
      models.transaction.create(t).then(function(result) {
        console.log('Transaction created: ', result);
        payment.setTransaction(result.dataValues.id).then(function(result) {
          console.log('payment update result: ', result.dataValues);
        }).catch(function(error) {
          logger.warning(error);
        });
      }).catch(function(error) {
        console.log(error);
      });
    }
  });

  return Payment;
};
