/**
 * Created by Amri on 6/11/2016.
 */

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

exports.bodyMustHave = baseValidator.bind(this, 'checkBody');
exports.queryMustHave = baseValidator.bind(this, 'checkQuery');