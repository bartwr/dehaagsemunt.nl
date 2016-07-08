'use strict';

var express = require('express');
var jwt = require('./../controllers/jwt.controller');
var controller = require('../controllers/transaction.controller');
var permissions = require('../permissions/transaction.permissions');
var router = express.Router();

module.exports = function(app){
  router.get('/',
    permissions.canView,
    controller.index
  );

  router.get('/:id',
    permissions.canView,
    controller.show
  );

  router.post('/',
    jwt.checkAccount,
    permissions.canCreate,
    controller.create
  );
  router.put('/:id',
    permissions.canUpdate,
    jwt.checkAccount,
    controller.update
  );
  router.delete('/:id',
    permissions.canDelete,
    jwt.checkAccount,
    controller.destroy
  );

  app.use('/transaction', router);
};
