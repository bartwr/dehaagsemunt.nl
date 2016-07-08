'use strict';

var jwt = require('jwt-simple');
var settings = require('./../config/settings');
var moment = require('moment');
var request = require('request');
var models = require('./../models/index');

// Decode the token if present and add it to req
exports.decode = function(req,res,next) {
  console.log('checking jwt');
  console.log(req.headers.authorization);
  req.jwt = req.jwt || {};
  if (req.headers.authorization){
    var token = req.headers.authorization.split(' ')[1];
    try {
      var payload = jwt.decode(token, settings.jwt.secret, 'base64');
      if ( (payload.exp) && (payload.exp > moment().unix()) ) {
        req.jwt = payload;
      }
    } catch (err) {
      console.log('Error decoding token: ', err);
    }
  }

  // // Always proceed
  next();
};

// Validate account based on supplied jwt
exports.checkAccount = function(req,res,next) {
  console.log('Fetching account based on jwt.' );
  console.log(req.jwt);
  if (req.jwt && req.jwt.account_id) {
    models.account.findById(req.jwt.account_id).then(function(account) {
      req.user = account.dataValues;
      next();
    }).catch(function(error) {
      console.log('Error fetching account: ', error);
      next();
    });
  } else {
    next();
  }
};
