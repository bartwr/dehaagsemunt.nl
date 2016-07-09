'use strict';

var logger = require('winston');
var balanceController = require('../controllers/balance.controller');

module.exports = function(sequelize, DataTypes) {

  var Transaction = sequelize.define('transaction', {

    type: {
      type: DataTypes.STRING,
      defaultValue: 'ob'
    },

    description: DataTypes.STRING,

    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {

        Transaction.belongsTo(models.account, {
          as: 'sender',
          foreignKey: 'from_id'
        });

        Transaction.belongsTo(models.account, {
          as: 'recipient',
          foreignKey: 'to_id'
        });

        Transaction.hasMany(models.balance, {
          as: 'balance'
        });
      }
    }
  });

  return Transaction;
};
