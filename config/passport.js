/* globals sails, User, CipherService */

'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
//var FacebookTokenStrategy = require('passport-facebook-token').Strategy;

var config = require('./local');

/**
 * Configuration object for local strategy
 * @type {Object}
 * @private
 */
var LOCAL_STRATEGY_CONFIG = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: false
};

/**
 * Configuration object for JWT strategy
 * @type {Object}
 * @private
 */
var JWT_STRATEGY_CONFIG = {
    secretOrKey: config.passport.jwt.secret,
    issuer: config.passport.jwt.issuer,
    audience: config.passport.jwt.audience,
    passReqToCallback: false,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

/**
 * Configuration object for social strategies
 * @type {Object}
 * @private
 */
// var SOCIAL_STRATEGY_CONFIG = {
//     clientID: '-',
//     clientSecret: '-',
//     consumerKey: '-',
//     consumerSecret: '-',
//     passReqToCallback: true
// };

/**
 * Triggers when user authenticates via local strategy
 * @param {String} email Email from body field in request
 * @param {String} password Password from body field in request
 * @param {Function} next Callback
 * @private
 */
function _onLocalStrategyAuth(email, password, next) {
  User
    .findOne({email: email})
    .exec(function (error, user) {
      if (error) { return next(error, false, {}); }

      if (!user) {
        return next(null, false, {
          code: 'E_USER_NOT_FOUND',
          message: email + ' is not found'
        });
      }

      if (!CipherService.comparePassword(password, user)) {
        return next(null, false, {
          code: 'E_WRONG_PASSWORD',
          message: 'Password is wrong'
        });
      }

      return next(null, user, {});
    });
}

/**
 * Triggers when user authenticates via JWT strategy
 * @param {Object} payload Decoded payload from JWT
 * @param {Function} next Callback
 * @private
 */
function _onJwtStrategyAuth(payload, next) {

  var user = payload.user;

  return next(null, user);
}

/**
 * Triggers when user authenticates via one of social strategies
 * @param {Object} req Request object
 * @param {String} accessToken Access token from social network
 * @param {String} refreshToken Refresh token from social network
 * @param {Object} profile Social profile
 * @param {Function} next Callback
 * @private
 */
// function _onSocialStrategyAuth(req, accessToken, refreshToken, profile, next) {
//     if (!req.user) {
//         // TODO: move to ComputedPropertyName ES6
//         var criteria = {};
//         criteria['socialProfiles.' + profile.provider + '.id'] = profile.id;
//
//         var model = {
//             username: profile.username || profile.displayName || '',
//             email: (profile.emails[0] && profile.emails[0].value) || '',
//             firstName: (profile.name && profile.name.givenName) || '',
//             lastName: (profile.name && profile.name.familyName) || '',
//             photo: (profile.photos[0] && profile.photos[0].value) || '',
//             socialProfiles: {}
//         };
//         model.socialProfiles[profile.provider] = profile._json;
//
//         User
//             // TODO: check if criteria is working
//             .findOrCreate(criteria, model)
//             .exec(function (error, user) {
//                 if (error) return next(error, false, {});
//                 if (!user) return next(null, false, {
//                     code: 'E_AUTH_FAILED',
//                     message: [profile.provider.charAt(0).toUpperCase(), profile.provider.slice(1), ' auth failed'].join('')
//                 });
//
//                 return next(null, user, {});
//             });
//     } else {
//         req.user.socialProfiles[profile.provider] = profile._json;
//         req.user.save(next);
//     }
// }

passport.use(new LocalStrategy(LOCAL_STRATEGY_CONFIG, _onLocalStrategyAuth));

passport.use(new JwtStrategy(JWT_STRATEGY_CONFIG, _onJwtStrategyAuth));