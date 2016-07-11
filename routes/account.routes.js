'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/account.controller');
var permission = require('../permissions/account.permissions');
var jwt = require('./../controllers/jwt.controller');

module.exports = function(app){

  router.get('/',
    jwt.checkAccount,
    permission.canView,
    controller.index
  );

  router.get('/:id',
    jwt.checkAccount,
    permission.canView,
    controller.show
  );

  router.get('/:id/balance',
    jwt.checkAccount,
    permission.canView,
    controller.showBalance
  );

  router.post('/search',
    jwt.checkAccount,
    permission.canView,
    controller.search
  );

  app.use('/account', router);
};
