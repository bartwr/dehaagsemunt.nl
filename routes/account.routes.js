'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/account.controller');
var permission = require('../permissions/account.permissions');

module.exports = function(app){

  router.get('/',
    permission.canView,
    controller.index
  );

  router.get('/:id',
    permission.canView,
    controller.show
  );

  router.get('/:id/balance',
    permission.canView,
    controller.showBalance
  );

  router.post('/search',
    permission.canView,
    controller.search
  );

  app.use('/account', router);
};
