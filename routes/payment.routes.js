'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/payment.controller');
var permission = require('../permissions/payment.permissions');
var jwt = require('./../controllers/jwt.controller');

module.exports = function(app){

  router.post('/',
    jwt.checkAccount,
    permission.canCreate,
    controller.create
  );

  router.post('/mollie-hook',
    controller.mollieHook
  );

  app.use('/payment', router);
};
