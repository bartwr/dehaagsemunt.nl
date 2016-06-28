'use strict';

module.exports = function(sequelize, DataTypes) {

  var Account = sequelize.define('account', {

    email: DataTypes.STRING,
    username: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,

    accountnumber: DataTypes.STRING,

  },{
    classMethods: {
      associate: function(models) {

        Account.hasMany(models.transaction, {
          as: 'sender',
          foreignKey: 'from_id'
        });

        models.account.hasMany(models.transaction, {
          as: 'recipient',
          foreignKey: 'to_id'
        });
      }
    }
  });

  return Account;
};
