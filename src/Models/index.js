var users = require('../schemas/users');
var invitationTemps = require('../schemas/invitationsTemp');
var avoirAmis = require('../schemas/avoirAmis');
var groupes = require('../schemas/groupe');
var membreDes = require('../schemas/membreDe');
var messageGroupes = require('../schemas/messagesGroupe');
var messagePrive = require('../schemas/messagesPrive');


exports.User = mongoose.model('Users', users.schemaUsers);
exports.InvitationTemp = mongoose.model('InvitationTemps', invitationTemps.schemaInvitationtemps);
exports.AvoirAmi = mongoose.model('AvoirAmis', avoirAmis.schemaAvoirAmis);
exports.Groupe = mongoose.model('Groupes', groupes.schemaGroupes);
exports.MembreDe = mongoose.model('MembreDes', membreDes.schemaMembreDes);
exports.MessageGroupes = mongoose.model('MessageGroupes', messageGroupes.schemaMessagesGroupes);
exports.MessagePrive = mongoose.model('MessagesPrive', messagePrive.schemaMessagesPrive);

exports.getUserByUsername = function (username, callback) {
    var query = {email: username};
    models.User.findOne(query, callback);
}

exports.getUserById = function (id, callback) {
    models.User.findById(id, callback);
}

exports.comparePassword = function (candidatePassword, hash, callback) {

    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {

        if (err)
            throw err;
        callback(null, isMatch);
    });
}
