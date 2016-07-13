'use strict';

/***
 *
 * Sendgrid mail service
 * https://github.com/sendgrid/sendgrid-nodejs/blob/master/examples/helpers/mail/example.js
 *
 ***/

var models   = require('../models/index');
var settings = require('../config/settings');
var logger   = require('winston');
var helper   = require('sendgrid').mail;
var sendgrid = require('sendgrid').SendGrid(settings.sendgrid.key);

/*
var mail = require('./services/mail.service');
mail.send({
  to_email: 'arn@urbanlink.nl',
  to_name: 'Arn van der Pluijm',
  body: 'This is a new message!',
  template: 'general',
}, function(error, result) {
  if (error) { logger.debug('Error sending mail: ', error); }
});
*/

function handleError(status, cb) {
  logger.debug('Error sending mail: ', status);
  // TODO: Add to watchdog
  cb();
}


/**
 *
 * Send an email using the sendgrid service
 *
 **/
exports.send = function(options, cb) {
  logger.debug('Sending a new email');

  // List of available templates at sendgrid
  var templates = {
    general: '820e4d7e-8cb7-4449-b139-1e64cef7759e',
    payment_success: '820e4d7e-8cb7-4449-b139-1e64cef7759e',
    payment_error: '820e4d7e-8cb7-4449-b139-1e64cef7759e',
    transaction_success: '820e4d7e-8cb7-4449-b139-1e64cef7759e',
    transaction_error: '820e4d7e-8cb7-4449-b139-1e64cef7759e'
  };

  // Validate message options
  var error;
  options = options || {};
  if (!options.to_email) { error = 'No to_email set'; }
  if (!options.to_name) { error = 'No to_name set'; }
  if (!options.body) { error = 'No body set'; }
  options.subject = options.subject || 'Een nieuw bericht van De Haagse Munt';
  options.template = options.template || 'general';

  if (error) { handleError(error); }

  // Set up the new mail object
  var mail = new helper.Mail();

  mail.setTemplateId(templates[options.template]);
  mail.setFrom(new helper.Email('no-reply@dehaagsemunt.nl', 'De Haagse Munt'));
  mail.setSubject(options.subject);

  var personalization = new helper.Personalization();
  // set the to address
  personalization.addTo(new helper.Email(options.to_email, options.to_name));
  // add the substitutions for fields in the sendgrid template
  personalization.addSubstitution(new helper.Substitution('%body%', options.body));
  mail.addPersonalization(personalization);

  // mail.addContent(new helper.Content('text/plain', 'De Haagse Munt'));
  mail.addContent(new helper.Content('text/html', 'De Haagse Munt'));

  // Send the request to sendgrid
  var requestBody = mail.toJSON();
  var request = sendgrid.emptyRequest();
  request.method = 'POST';
  request.path = '/v3/mail/send';
  request.body = requestBody;

  // Send the mail with sendgrid-api
  sendgrid.API(request, function (response) {
    logger.debug('Mail sent result: ', response.statusCode);
    if (response.statusCode !==202) {
      handleError(response.body, function() {
        cb();
      });
    }
    cb();
  });
};
