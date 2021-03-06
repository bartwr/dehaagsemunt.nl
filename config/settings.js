'use strict';

var path = require('path');
var env = {};

try {
  env = require('./env.js');
} catch (err) { }

module.exports = {

  root          : path.normalize(__dirname + '/..'),

  environment   : process.env.NODE_ENV              || env.NODE_ENV                || 'development',
  port          : process.env.NODE_API_PORT         || env.NODE_API_PORT           || 8000,

  db : {
    name        : process.env.DATABASE_NAME         || env.DATABASE_NAME           || 'database',
    username    : process.env.DATABASE_USERNAME     || env.DATABASE_USERNAME       || 'username',
    password    : process.env.DATABASE_PASSWORD     || env.DATABASE_PASSWORD       || 'password',
    port        : process.env.DATABASE_PORT         || env.DATABASE_PORT           || '3306',
    settings: {
      host        : process.env.DATABASE_HOST         || env.DATABASE_HOST           || 'localhost',
      dialect     : process.env.DATABASE_DIALECT      || env.DATABASE_DIALECT        || 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      logging: false,
      define: {
        underscored: true,
        timestamps: true,
        freezeTableName: true
      }
    }
  },

  jwt : {
    secret      : process.env.JWT_SECRET            || env.JWT_SECRET               || '12345',
    root        : process.env.JWT_ROOT              || env.JWT_ROOT                 || 'https://auth0.com'
  },

  admin: {
    name: 'Arn van der Pluijm',
    email: 'arn@urbanlink.nl'
  },

  sendgrid : {
    key         : process.env.SENDGRID_APIKEY      || env.SENDGRID_APIKEY        || '',
  },

  aws: {
    key         : process.env.AWS_ACCESS_KEY_ID     || env.AWS_ACCESS_KEY_ID       || '',
    secret      : process.env.AWS_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY   || '',
    bucket      : process.env.AWS_S3_BUCKET_NAME    || env.AWS_S3_BUCKET_NAME      || '',
    endpoint    : process.env.AWS_S3_ENDPOINT       || env.AWS_S3_ENDPOINT         || '',
  },

  // synchronization settings.
  sync: {

  },

  mollie: {
    apikey: process.env.MOLLIE_KEY || env.MOLLIE_KEY || ''
  }
};
