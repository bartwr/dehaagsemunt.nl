'use strict';

var express = require('express');
var router = express.Router();
var controller = require('../controllers/transaction.controller');
var permissions = require('../permissions/transaction.permissions');

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
    permissions.canCreate,
    controller.create
  );
  router.put('/:id',
    permissions.canUpdate,
    controller.update
  );
  router.delete('/:id',
    permissions.canDelete,
    controller.destroy
  );

  app.use('/transaction', router);
};
