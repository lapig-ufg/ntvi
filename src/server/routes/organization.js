module.exports = function (app) {
    const control = app.controllers.organization;
    const JWT     = app.middleware.jwt;

    app.get('/service/organizations', JWT.verifyJWT, control.getAllOrganizations);
    app.get('/service/organizations/:id', JWT.verifyJWT, control.getOrganization);
    app.post('/service/organizations', JWT.verifyJWT, control.createOrganization);
    app.put('/service/organizations/:id', JWT.verifyJWT, control.updateOrganization);
    app.delete('/service/organizations/:id', JWT.verifyJWT, control.deleteOrganization);
}