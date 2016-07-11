/**
 * Created by Amri on 6/11/2016.
 */
const escapeStringRegexp    = require('escape-string-regexp');

var _                       = require('underscore');

var lodash                  = require('lodash');

/**
 * Provides basic validation
 * @param {string} validate name of the function in req to be called, e.g. checkBody
 * @param {string} params string of parameters that needs validating, e.g. 'username password'
 * @returns {Function} middleware(req, res, next)
 */
function baseValidator(validate, params){
    var args = params.split(' ');
    return function(req, res, next) {
        if(!req.validationErrors){
            throw new Error("express-validator must be used for this to work");
        }

        for (var i = 0; i < args.length; i++) {
            req[validate](args[i], args[i] + ' must not be empty').notEmpty();
        }
        var errors = req.validationErrors();
        if (errors) {
            errors.status = 400;
            errors.message = 'Invalid parameter';
            return next(errors);
        }else{
            return next();
        }
    }
}

/**
 * Escapes parameters
 * @param {string} location location of values, e.g. 'body' or 'query'
 * @param {string} params string of parameters that needs escaping, e.g. 'username password'
 * @returns {Function} middleware(req, res, next)
 */
function escape(location, params){
    var args = params.split(' ');
    return function(req, res, next) {
        for (var i = 0; i < args.length; i++) {
            req[location][args[i]] = escapeStringRegexp(req[location][args[i]]);
        }
        return next();
    }
}

exports.bodyMustHave    = baseValidator.bind(this, 'checkBody');
exports.queryMustHave   = baseValidator.bind(this, 'checkQuery');
exports.escapeBody      = escape.bind(this, 'body');
exports.escapeQuery     = escape.bind(this, 'query');
exports.toInts          = function(params){
    var args = params.split(' ');
    return function(req, res, next) {
        for (var i = 0; i < args.length; i++) {
            req.query[args[i]] = parseInt(req.query[args[i]]);
            req.body[args[i]] = parseInt(req.body[args[i]]);
            if(isNaN(req.query[args[i]]) && isNaN(req.body[args[i]])) return next(new exports.HTTPError(400, args[i] + ' must be an integer'));
        }
        return next();
    }
};
exports.isIn = function(param, objOrArray, message){
    return function(req, res, next) {
        var val = lodash.get(req, param);
        if (val) {
            val = val.split(',');
            if (!Array.isArray(objOrArray)) objOrArray = _.values(objOrArray);
            if (val.length && !_.difference(val, objOrArray).length) return next();
        }
        return next(new exports.HTTPError(400, message || param + " must be in " + JSON.stringify(objOrArray)));
    };
};

exports.inRange = function(param, min, max){
    return function(req, res, next){
        var val = lodash.get(req, param);
        if(val <= max && val >= min){
            next();
        }else next(new exports.HTTPError(400, param + " must be between " + min + " & " + max));
    }
};

exports.HTTPError       = function(code, message) {
    this.status = code;
    this.message = message;
};