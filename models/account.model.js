'use strict';

module.exports = function(sequelize, DataTypes) {

  var Account = sequelize.define('account', {

    email: DataTypes.STRING,
    username: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,

    accountnumber: DataTypes.STRING,
    

  });

  return Account;
};
