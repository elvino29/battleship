exports.schemaUsers = new mongoose.Schema({
    name: {type: String, maxlength: 50},
    pseudo: {type: String, maxlength: 50},
    email: {type: String, maxlength: 100},
    status: {type: String, maxlength: 150},
    profil: {type: String, maxlength: 250},
    password: {type: String, maxlength: 60}
});