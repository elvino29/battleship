exports.schemaInvitationtemps = new mongoose.Schema({
    idUsers: {type: String, maxlength: 50},
    idUserInvit: {type: String, maxlength: 254}
});