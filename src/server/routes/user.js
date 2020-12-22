module.exports = function (app) {
    const control = app.controllers.user;
    const JWT     = app.middleware.jwt;

    app.get('/service/user/:id', JWT.verifyJWT, control.getUserByID);
    app.put('/service/user/:id', JWT.verifyJWT, control.updateUser);
    app.get('/service/users', JWT.verifyJWT, control.getAllUsers);
    app.delete('/service/user/:id', JWT.verifyJWT, control.deleteUser);
}