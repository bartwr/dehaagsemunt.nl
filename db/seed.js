'use strict';

var db = require('../models/index');
var balanceCtrl = require('./../controllers/balance.controller');

module.exports = {
  seed: function() {
    
        db.account.bulkCreate([
          {
            username: 'Arn',
            first_name: 'Arn',
            last_name: 'van der Pluijm',
            accountnumber: '1',
            email: 'arn@urbanlink.nl'
          },
          {
            username: 'Bart',
            accountnumber: '2'
          }
        ], {returning: true}).then(function(result) {

          for (var i=0; i<result.length; i++){
            db.transaction.create({
              type: 'B',
              amount: 100,
              amount_meta: '[100,0,0,0,0,0]',
              to_id: i+1,
              description: 'Inleg'
            }).then(function(result) {
              balanceCtrl.handleTransaction(result.dataValues.id);
              // console.log(result);
            });
          }
        });
  }
};
