exports.create = function (req, res) {

    var name = req.body.name;
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var password = req.body.password;
    var confpass = req.body.confpass;

    //validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('pseudo', 'Pseudo is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email is not valid').isEmail();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('confpass', 'passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
    } else {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                req.body.password = hash;

                var returnResponse = function (obj) {
                    req.flash('success_msg', 'You are now registered and can now login');
                    res.redirect('/');
                };
                models.User(req.body).saveAsync()
                    .then(returnResponse);

            });
        });
    }
};

exports.logged = function (req, res) {
    res.redirect('/accueil');
};

exports.islogin = function (req, res) {
    res.render('accueil');
};

exports.profil = function (req, res) {
    res.render('profil');
};

exports.Upprofil = function (req, res) {

    var options = {_id: req.body._id};

    var returnUpdateObject = function () {
        models.User.findOneAsync(options)
            .then(logLib.logContent);

    }

    delete req.body['_id'];

    models.User.findOneAndUpdateAsync(options, req.body)
        .then(returnUpdateObject);

    res.redirect('/profil');
};

exports.game = function (req, res) {
    res.sendFile(path.resolve('vuejs/index.html'));
};
