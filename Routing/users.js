var users = require('../src/controllers/usersController');

app.post('/inscription', users.create);
app.post('/login',
    passport.authenticate('local', {successRedirect: '/accueil', failureRedirect: '/test', failureFlash: true}),
    users.logged);

app.get('/accueil', ensureAuthenticated, users.islogin);
app.get('/profil',ensureAuthenticated, users.profil);
app.put('/profil',ensureAuthenticated, users.Upprofil);
app.get('/game',ensureAuthenticated, users.game);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
};
