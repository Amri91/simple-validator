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

/**
 * Objectifies request data, by getting the properties mentioned in params from req.body, req.query, and req.params
 * into one place: req.data.
 * @param {String} params properites that will be included in req.data. e.g. 'username email password'.
 * @param {Boolean} [areParamsRequired=false] optional field, specifies whether the params are required or not, if set to true, the method will throw an exception if a param is missing
 * @returns {Function} middleware(req, res, next)
 */
exports.objectifyRequestData       = function(params, areParamsRequired){
    //Get all params.
    var args = params.split(' ');

    //Return middleware.
    return function(req, res, next){
        //Objects inside req, that the function will search in for the given params.
        var objectsToLookIn = ['body','query', 'params'];

        //Initialize req.data
        req.data = req.data || {};

        //Loop for all params.
        for(var i = 0 ; i < args.length; i++){
            //Declare value.
            var value = null;

            //Declare current value of argument.
            var curr = null;

            //Loop through all objects: body, query, params.
            for(var j = 0 ; j < objectsToLookIn.length ; j++){

                // Search for the value in all sub objects inside req.
                curr = getOwnProperty(req[objectsToLookIn[j]], args[i]);

                //If a value is found.
                if(curr != null) {
                    //If there was a value found in another subobject, throw an error.
                    if(value != null)
                        return next(new exports.HTTPError(400, args[i] + ' exists in more than one object'));
                    //Assign the found value to the value variable.
                    value = curr;
                }
            }
            //Add a new key, value pair for the found value.
            if(value != null) req.data[args[i]] = value;
            //If no value was found for the current key, throw an error.
            else if(areParamsRequired) return next(new exports.HTTPError(400, args[i] + ' is not found anywhere'));
        }
        next();
    }
};


exports.bodyMustHave    = baseValidator.bind(this, 'checkBody');
exports.queryMustHave   = baseValidator.bind(this, 'checkQuery');
exports.escapeBody      = escape.bind(this, 'body');
exports.escapeQuery     = escape.bind(this, 'query');
exports.toInts          = function(params){
    var args = params.split(' ');
    return function(req, res, next) {
        for (var i = 0; i < args.length; i++) {
            if(req.query[args[i]] != null) {
                req.query[args[i]] = parseInt(req.query[args[i]]);
            }
            if(req.body[args[i]] != null) {
                req.body[args[i]] = parseInt(req.body[args[i]]);
            }
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

// https://stackoverflow.com/a/2631198/2198071
function checkNested(obj, args) {
    for (var i = 0; i < args.length; i++) {
        if (!obj || !obj.hasOwnProperty(args[i])) {
            return false;
        }
        obj = obj[args[i]];
    }
    return true;
}

function hasOwnNestedProperty(obj, propertyPath){
    return checkNested(obj, propertyPath.split('.'));
}

function getOwnProperty(obj, property){
    // To protect against gettings properties in prototype
    if(hasOwnNestedProperty(obj, property))
        return lodash.get(obj, property);
}

/**
 * Integration with the library expressjs-plus
 * @param param
 * @param paramsArray
 * @param req
 * @returns {boolean}
 */
exports.dataHandler = function(param, paramsArray, req){
    if(param === 'data'){
        paramsArray.push(req.data);
    }else if(req.data && req.data.hasOwnProperty(param)){
        paramsArray.push(req.data[param]);
    }else return false;
    return true;
};