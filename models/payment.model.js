'use strict';

var logger = require('winston');

module.exports = function(sequelize, DataTypes) {

  var Payment = sequelize.define('payment', {

    description: DataTypes.STRING,

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: 'concept'
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
