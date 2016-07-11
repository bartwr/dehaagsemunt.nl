'use strict';

var logger = require('winston');

module.exports = function(sequelize, DataTypes) {

  var Payment = sequelize.define('payment', {

    description: DataTypes.STRING,

    amount: {
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
          as: 'transcation',
          foreignKey: 'transaction_id'
        });

      }
    }
  });

  return Payment;
};
