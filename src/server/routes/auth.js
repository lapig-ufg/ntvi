module.exports = function (app) {

    var control = app.controllers.auth;

    app.post('/api/auth/login', control.login);
    app.post('/api/auth/oauth', control.oauth);
    app.post('/api/auth/register', control.register);
    app.get('/api/auth/logout', control.logout);
}