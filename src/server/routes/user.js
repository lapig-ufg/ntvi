module.exports = function (app) {

    var control = app.controllers.user;

    app.get('/service/user/', control.getUserByID);
    app.get('/service/users', control.getAllUsers);
}