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
  * Usage: makeInts('skip limit')
- escapeBody
  * Escapes selected params in body
  * Usage: escapeBody('username')
- escapeQuery
  * Escapes selected params in query
  * Usage: escapeQuery('type')
- in
  * Checks if a parameter is in array, useful for enums
  * Usage: isIn('body.NY', ['NY', 'LA']) the function will check req.body.NY
- inRange
  * Checks if a parameter is between a given [min, max] values
  * Usage: inRange('query.age', 20, 22) the function will check req.query.age
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