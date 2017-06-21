// express
var express = require('express');

// handlebars
var handlebars = require('express-handlebars');

// socket io
app = express();

http = require('http').Server(app);
var io = require('socket.io')(http);

// import models
// models = require('./src/Models');

// import routing
// require('./Routing');

// server conf
http.listen(3000, (
    console.log('http://localhost:3000')
));
