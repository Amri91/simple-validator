/**
 *  Integration testing module for the library.
 */

var should = require('should');
var sinon  = require('sinon');

var functions = require('../index');

describe('#objectifyRequestData Function Integration Testing', function(){
    it('should bring all arguments to one place', function(done){
        //Mock arguments.
        var arguments = "bodyArg paramsArg queryArg";

        //Mock req.data
        var expectedReqData  = {
            bodyArg: "Body argument",
            queryArg: "query argument",
            paramsArg: "parameters argument"
        };

        var req = mockReq();


        //Mock res.
        var res = sinon.spy();

        //Get the middleware
        var middleware = functions.objectifyRequestData(arguments);



        //Call the middleware.
        middleware(req, res, function(err){
            should.not.exist(err);

            should.exists(req.data);

            req.data.should.deepEqual(expectedReqData);

            done();
        });
    });//End of it.

    it('Should throw an error when an argument is found in more than one place', function(done){
        //Mock arguments.
        var arguments = "bodyArg repeatedArg";

        //Mock response object.
        var res = sinon.spy();

        //Mock request.
        var req = mockReq();
        req.body.repeatedArg = "Repeated argument in body.";
        req.query.repeatedArg = "Repeated argument in  query.";

        //Get middleware.
        var middleware = functions.objectifyRequestData(arguments);

        //Call middleware
        middleware(req, res, function(err){
            should.exist(err);

            done();
        });//End of middleware.
    });//End of it should throw an error when an argument is found in more than one place.

    it('Should get the found argument, and if one argument is not found, it will not include it in the req.data', function(done){
        //Mock arguments.
        var arguments = "notFoundArgument";

        //Mock response object.
        var res = sinon.spy();

        //Mock request.
        var req = mockReq();

        //Get the middleware.
        var middleware = functions.objectifyRequestData(arguments);

        //Call middleware.
        middleware(req, res, function(err){
            should.not.exist(err);

            should.exist(req.data);

            req.data.should.deepEqual({});

            done();
        });
    });//End of it should get the found argument.
    it('Should get the found required argument, and if the argument is not found, it will throw an error', function(done){
        //Mock arguments.
        var arguments = "bodyArg notFoundArg";

        //Mock response object.
        var res = sinon.spy();

        //Mock request.
        var req = mockReq();

        //Get the middleware.
        var middleware = functions.objectifyRequestData(arguments, true);

        //Call middleware.
        middleware(req, res, function(err){
            should.exist(err);

            err.status.should.equal(400);
            err.message.should.equal("notFoundArg is not found anywhere");

            done();
        });
    });//End of it should get the found required argument.
    it('Should not fail when using param names that exist in prototype', function(done){
        //Mock arguments.
        var arguments = "bodyArg constructor";

        //Mock response object.
        var res = sinon.spy();

        //Mock request.
        var req = mockReq({"constructor": 1});

        //Get the middleware.
        var middleware = functions.objectifyRequestData(arguments);

        //Call middleware.
        middleware(req, res, function(err){
            should.not.exist(err);

            done();
        });
    });//Should ignore invalid arguments passed after the colon ":"

});//End of describe Objectify function integration testing.

describe('#inRange function integration testing', function(){
    it('Should return true when the values are in range', function(done){
        //Mock Arguments.
        var arguments = "query.num1";

        //Mock req.
        var req = mockReq(null, {num1: -2}, null);

        //Mock res.
        var res = sinon.spy();

        //Get middleware.
        var middleware = functions.inRange(arguments, -5, 0);

        //Call the middleware.
        middleware(req, res, function(err){
            should.not.exist(err);

            done();
        });
    });//End of it.
    it('Should return false when the values are not in range', function(done){
        //Mock Arguments.
        var arguments = "params.num1";

        //Mock req.
        var req = mockReq(null, null, {num1: -2});

        //Mock res.
        var res = sinon.spy();

        //Get middleware.
        var middleware = functions.inRange(arguments, -1, 0);

        //Call the middlware.
        middleware(req, res, function(err){
            should.exist(err);

            done();
        });
    });//End of it.
    it('Should return false when the keys are not found', function(done){
        //Mock Arguments.
        var arguments = "params.num1";

        //Mock req.
        var req = mockReq(null, null, null);

        //Mock res.
        var res = sinon.spy();

        //Get middleware.
        var middleware = functions.inRange(arguments, -1, 0);

        //Call the middleware.
        middleware(req, res, function(err){
            should.exist(err);

            done();
        });
    });//End of it.
});//End of in range function.

describe('#toInts function integration testing', function(){
    it('Should convert values to ints', function(done){
        //Mock Arguments.
        var arguments = "num1 num2";

        //Mock req.
        var req = mockReq({num2: "0102"}, {num1: "-2"});

        //Mock res.
        var res = sinon.spy();

        //Get middleware.
        var middleware = functions.toInts(arguments);

        //Call the middleware.
        middleware(req, res, function(err){
            should.not.exist(err);

            should.exist(req.query);
            should.exist(req.body);

            should.exist(req.query.num1);
            should.exist(req.body.num2);

            req.query.num1.should.be.type('number');
            req.body.num2.should.be.type('number');

            req.query.num1.should.equal(-2);
            req.body.num2.should.equal(102);


            done();
        });
    });//End of it.
    it('Should throw an error when one of the values is not an int', function(done){
        //Mock Arguments.
        var arguments = "num1 num2";

        //Mock req.
        var req = mockReq({num2: "0102"}, {num1: "String"});

        //Mock res.
        var res = sinon.spy();

        //Get middleware.
        var middleware = functions.toInts(arguments);

        //Call the middleware.
        middleware(req, res, function(err){
            should.exist(err);
            done();
        });
    });//End of it.
    it('Should throw an error when one of the values is not found', function(done){
        //Mock Arguments.
        var arguments = "num1 num2";

        //Mock req.
        var req = mockReq({num2: "0102"});

        //Mock res.
        var res = sinon.spy();

        //Get middleware.
        var middleware = functions.toInts(arguments);

        //Call the middleware.
        middleware(req, res, function(err){
            should.exist(err);
            done();
        });
    });//End of it.
});//End of toInts integration testing.


function mockReq(body, query, params){
    //Mock req object.
    return {
        body: body || {
            bodyArg: "Body argument",
            bodyArg2: "Another body argument"
        },

        query: query || {
            queryArg: "query argument",
            queryArg2: "Another query argument"
        },

        params: params || {
            paramsArg: "parameters argument",
            paramsArg2: "Another parameters argument"
        }
    };
}