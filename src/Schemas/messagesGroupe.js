exports.schemaMessagesGroupes = new mongoose.Schema({
    idGroupe: {type: String, maxlength: 60},
    messageText: {type: String, maxlength: 254},
    time: {type: Date, default: new Date()}
});

