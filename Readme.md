#Validator for express js

This provides basic validation middleware, it will help reduce redundancy in the code.

##Available methods
- bodyMustHave
  * Checks if body contains selected params
  * Usage: bodyMustHave('password username')
- queryMustHave
  * Checks if query contains selected params
  * Usage: queryMustHave('password username')
- toInts
  * Attempts to convert selected params in query/body to integers
  * Usage: toInts('skip limit')
- escapeBody
  * Escapes selected params in body
  * Usage: escapeBody('username')
- escapeQuery
  * Escapes selected params in query
  * Usage: escapeQuery('type')
- isIn
  * Checks if a parameter is in array, useful for enums
  * Usage: isIn('body.NY', ['NY', 'LA']) the function will check req.body.NY
  * You can add a message in the third optional parameter, isIn isIn('body.NY', ['NY', 'LA'], 'City is not supported')
- inRange
  * Checks if a parameter is between a given [min, max] values
  * Usage: inRange('query.age', 20, 22) the function will check req.query.age
- objectifyRequestData
  * Gets the properties mentioned in the given params from req.body, req.query, and req.params and dumps them in req.data
  * Usage: objectifyRequestData('username:true password:t email') the function will get: username, password, and email, from req.body, req.query, req.params, and copy them to req.data. If the email is not found, the middleware will pass and no error will be thrown. However, if the username or password were not found, the middlware will throw an error, because both of them are marked as required.
  * If one of the given params is found in multiple locations of the following: req.body, req.query, req.params, the middleware will call next(err).
  * You can specify whether each of the arguments are required or not by concatenating the argument name with a colon followed by either ('true', 't') to mark it as required, otherwise the argument is assumed to be not required.
- HTTPError
  * Helper for return error responses/messages

##Installation
```javascript
npm install simple-express-validator
```

##Usage
```javascript
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var expressValidator = require('express-validator');
app.use(expressValidator());

var bodyMustHave = require('validator').bodyMustHave;

app.post('/', bodyMustHave('username password'), function(req, res, next){
    // code that uses req.body.username and req.body.password
    return res.status(204).end();
});

// error handlers
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});

app.listen(3000);
```
