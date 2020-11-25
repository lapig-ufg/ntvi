module.exports = function (app) {

    var control = app.controllers.prismatest;

    app.get('/service/user/', control.getUserByID);

}