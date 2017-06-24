exports.create = function (req, res) {


    var name = req.body.name;
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var passwords = req.body.passwords;
    var confpass = req.body.confpass;

    //validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('pseudo', 'Pseudo is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email is not valid').isEmail();
    req.checkBody('passwords', 'password is required').notEmpty();
    req.checkBody('confpass', 'passwords do not match').equals(req.body.passwords);

    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
    } else {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.passwords, salt, function (err, hash) {
                req.body.passwords = hash;

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

