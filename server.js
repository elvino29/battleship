// express
path = require('path');
var express = require('express');

//bluebird and mongoose using promise
promise = require('bluebird');
mongoose = promise.promisifyAll(require('mongoose'));
fs = promise.promisifyAll(require('fs'));

// handlebars
var exphbs = require('express-handlebars');


cookieParser = require('cookie-parser');
expressValidator = require('express-validator');
flash = require('connect-flash');
var session = require('express-session');
passport = require('passport');
LocalStrategy = require('passport-local').Strategy;
bcrypt = require('bcryptjs');

// socket io
app = express();

http = require('http').Server(app);
var io = require('socket.io')(http);

// BodyParser middleware
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//config
app.use(express.static(path.join(__dirname + '/')));

app.set('views', __dirname + '/src/Views');
app.engine('handlebars', exphbs({defaultLayout: 'main', layoutsDir: __dirname + '/src/Views/layouts'}));
app.set('view engine', 'handlebars');

//mongodb database connection
mongoose.connect('mongodb://localhost/battleship_db');

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

//connect flash messages
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('errr_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})


// import models
models = require('./src/Models');

// import routing
require('./Routing/users');


// passport serialize and deserialize users
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    models.getUserById(id, function (err, user) {
        done(err, user);
    })
});

// define localStrategy of passport Js
passport.use(new LocalStrategy(
    function(username, password, done) {
        models.getUserByUsername(username, function (err, user) {
            if(err) throw  err;
            if (!user){
                return done(null, false, {message: 'Unknown User'});
            };

            models.comparePassword(password, user.password, function (err, isMatch) {
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }
));

// server conf
http.listen(9001, (
    console.log('http://localhost:9001')
));
