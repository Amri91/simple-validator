#Validator for express js

This provides basic validation middleware, it will help reduce redundancy in the code.

##Available methods
- bodyMustHave
- queryMustHave

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

var bodyMustHave = require('validator1').bodyMustHave;

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