'use strict';

module.exports = function(sequelize, DataTypes) {

  var Balance = sequelize.define('balance', {

    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },

    amount_meta: {
      type: DataTypes.STRING,
      allowNull: false
    }

  }, {
    classMethods: {

      associate: function(models) {

        models.account.hasOne(Balance, {
          as: 'account'
        });

        // Balance.hasOne(models.transaction, {
        //   as: 'transaction'
        // });
      }
    }
  });

  return Balance;
};
