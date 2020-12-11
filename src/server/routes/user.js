module.exports = function (app) {
    const control = app.controllers.user;
    const JWT     = app.middleware.jwt;

    app.get('/service/user/', JWT.verifyJWT, control.getUserByID);
    app.get('/service/users', JWT.verifyJWT, control.getAllUsers);
}