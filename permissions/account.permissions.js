'use strict';

var models = require('../models/index');
var settings = require('../config/settings');

exports.canView = function(req,res,next) {
  console.log('Check can view.');
  next();
};

exports.canCreate = function(req,res,next) {
  next();
};

exports.canUpdate = function(req,res,next) {
  next();
};

exports.canDelete = function(req,res,next) {
  next();
};
