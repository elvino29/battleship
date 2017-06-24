var users = require('../src/controllers/usersController');

app.post('/inscription', users.create);