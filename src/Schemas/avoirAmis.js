exports.schemaAvoirAmis = new mongoose.Schema({
    idUser: {type: String, maxlength: 50},
    idAmis: {type: String, maxlength: 100}
});