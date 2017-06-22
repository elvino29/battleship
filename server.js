// express
path = require('path');
var express = require('express');

// handlebars
var exphbs = require('express-handlebars');

// socket io
app = express();

http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname + '/')));

app.set('views', __dirname + '/src/Views');
app.engine('handlebars', exphbs({defaultLayout: 'main', layoutsDir: __dirname + '/src/Views/layouts'}));
app.set('view engine', 'handlebars');

// import models
// models = require('./src/Models');

// import routing
// require('./Routing');

// server conf
http.listen(3000, (
    console.log('http://localhost:3000')
));
