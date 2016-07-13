/* globals require, process, module */

'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var settings = require('./config/settings');
var logger = require('winston');
var express = require('express');
var moment = require('moment');
var app = express();
var Watchdog = require('./controllers/watchdog.controller');

// Setup logging
require('./config/logger').logger(app);

// Setup express
var server = require('http').createServer(app);
require('./config/express')(app);

// Setup Socket.io
// require('./config/socket')(server);

// Setup routes
require('./routes')(app);

// Setup models
var db = require('./models');

// Synchronize the database if needed
if (process.env.SYNCDB === 'true') {
  db.sequelize.sync({force: true}).then(function(result) {
    // Seed the database
    require('./db/seed').seed();
    start();
  });
} else {
  start();
}

// Start the server
function start() {
  server.listen(settings.port, settings.ip, function () {
    logger.debug('Express server listening on %d, in %s mode', settings.port, settings.environment);
    Watchdog.add('system', 'NOTICE', 'Express server started. ');
  });
}

// Initiate cron
//require('./config/cron')(app);

// Expose app
module.exports = app;
