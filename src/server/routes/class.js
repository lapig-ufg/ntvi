module.exports = function (app) {
    const control = app.controllers.class;
    const JWT     = app.middleware.jwt;

    app.get('/service/classes', JWT.verifyJWT, control.getAllClass);
    app.get('/service/classes/:id', JWT.verifyJWT, control.getClass);
    app.post('/service/classes', JWT.verifyJWT, control.createClass);
    app.put('/service/classes/:id', JWT.verifyJWT, control.updateClass);
    app.delete('/service/classes/:id', JWT.verifyJWT, control.deleteClass);
}