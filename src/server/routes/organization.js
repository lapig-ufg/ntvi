module.exports = function (app) {

    var control = app.controllers.organization;

    app.get('/service/organization/', control.getOrganizationByID);
    app.get('/service/organizations', control.getAllOrganizations);
}