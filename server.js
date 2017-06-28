// express
path = require('path');
var express = require('express');

//bluebird and mongoose using promise
promise = require('bluebird');
mongoose = promise.promisifyAll(require('mongoose'));
fs = promise.promisifyAll(require('fs'));

//logs
logLib = require('./src/lib/log');
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

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log(('user disconnect'));
    })

    socket.on('chat message', function (msg) {
        // io.emit('chat message', msg);
    });
});

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



var players = [], turns = 0;

var ships = [
    {'type': 'Aircaft', 'size': 5, 'rekt': false, 'available': 1, 'location' : []},
    {'type': 'Battleship', 'size': 4, 'rekt': false, 'available': 2, 'location' : []},
    {'type': 'Destroyer', 'size': 3, 'rekt': false, 'available': 3, 'location' : []},
    {'type': 'Submarine', 'size': 3, 'rekt': false, 'available': 3, 'location' : []},
    {'type': 'Patrolboat', 'size': 2, 'rekt': false, 'available': 4, 'location' : []}
]; //takes 39 hits before all ships are rekt

var updateShip = function(id, ship, callback){

    var player;

    console.log('Ship', ship);

    for (var i = 0; i< players.length; i++) {
        if(players[i].id == id) player = players[i];
    }


    for (var i = 0; i< ships.length; i++) {
        if (ships[i].type == ship.type) {
            player.ships.push(ship);
        }
    }

    console.log('player', player.id, 'ship', ship, 'ships', player.ships);
};

/**
 * Giving a player his turn to play.
 * socket.id  {[int]}   id   [network socketid]
 * @return {[boolean]}       [sets pemission to true]
 */
var permissionToFire = function(id, callback){
    players.map(function(enemy){if(enemy.id == id) callback(enemy.permissionToFire = true);
    });
}

io.on('connection', function(socket){
    var id = socket.id;
    console.log('a user connected');
//only 2 players allowed to play
    if (players.length >= 2){
        socket.emit('RoomIsFull', true);
        console.log('Room is full');
        return;
    }

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
        var option = {messageText: msg};
        models.MessageGroupes(option).saveAsync()
            .then(logLib.logContent);

    });

    socket.on('place', function(ship){
        updateShip(socket.id, ship, function(){
        });
    });

    /**
     * check if enemy is ready & send
     * @return {[boolean]}
     */
    socket.on('ready', function(){
        socket.broadcast.emit('enemyIsReady')
    });

//create player & push to players array with starting data.
    players.push({'id' : socket.id, 'ready': true, 'takenHits': 0, permissionToFire: false, 'ships': []});

    socket.on('init', function(player){
        var player;
        for (var i = players.length - 1; i >= 0; i--) {
            if(players[i].id == id) player = players[i]
        }

//init with if statement to force the correct id.
        if (id == socket.id) socket.emit('init', player);
        console.log(id + 'is ready to play');
    });

//message that 2 players are able to play
    if(players.length > 1){
        socket.emit('enemyIsFound', 'enemyIsFound');
        socket.broadcast.emit('enemyIsFound', 'enemyIsFound');
        players[0].permissionToFire = true; //give the first player permission to fire.
    };

    socket.on('fire', function(obj, id, ship){
        turns++;

        var enemy = [];
        // //define enemy
        players.map(function(player){if(player.id != socket.id) return enemy = player});
        console.log('enemy', enemy.id);

        /**
         * check if fired shot matches any ship location.
         * @boolean {[true]}
         */
        var hit = enemy.ships
                .map(ship => ship.location)
        .some(coordinates => coordinates.some(coordinate => coordinate === obj.coordination ));

        if(hit){
            enemy.takenHits++;
            console.log('Hit! '+ obj.coordination);
            socket.emit('hit', {'coordination' : obj.coordination, 'hit' : hit});

            /**
             * if all ships are hit, send win/lose message
             */
            if(enemy.takenHits >= 39) io.sockets.emit('win', enemy);

        }else{
            console.log('missed');
            console.log(obj.coordination);
        };

        /**
         * updating the bord of the current enemy
         * to show where the other play hit/missed.
         */
        socket.broadcast.emit('updateBoards', { 'coordination': obj.coordination, 'enemy':enemy});

        /**
         * give the turn to fire to the enemy who got shot.
         * @return {[object]}  [send enemy object]
         */
        permissionToFire(enemy.id, function(){
            io.sockets.connected[enemy.id].emit('permissionFire', enemy);
        });
        console.log(enemy);
    });

    socket.on('disconnect', function(){
        players.map(function(player, index){if(player.id == id) players.splice(index, 1)});
        console.log(id +" player left "+ players.length);
        console.log(('user disconnected'));
    });
});

// server conf
http.listen(9001, (
    console.log('http://localhost:9001')
));
