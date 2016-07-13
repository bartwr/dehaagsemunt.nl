'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/payment.controller');
var permission = require('../permissions/payment.permissions');
var jwt = require('./../controllers/jwt.controller');

module.exports = function(app){

  router.get('/',
    jwt.checkAccount,
    permission.canView,
    controller.index
  );

  router.post('/mollie-hook',
    controller.mollieHook
  );

  router.post('/',
    jwt.checkAccount,
    permission.canCreate,
    controller.create
  );

  app.use('/payment', router);
};
