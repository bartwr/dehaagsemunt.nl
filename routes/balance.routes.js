'use strict';

var express = require('express');
var jwt = require('./../controllers/jwt.controller');
var controller = require('../controllers/balance.controller');
var permissions = require('../permissions/balance.permissions');
var router = express.Router();

module.exports = function(app){
  router.post('/',
    permissions.canView,
    controller.index
  );

  router.post('/:id',
    permissions.canView,
    controller.show
  );


  app.use('/balance', router);
};
