module.exports = function (app) {
    const control = app.controllers.campaign;
    const JWT = app.middleware.jwt;

    app.post('/service/campaign/create', JWT.verifyJWT, control.createCampaign);
    // app.get('/service/organizations/:id', JWT.verifyJWT, control.getOrganization);
    // app.post('/service/organizations', JWT.verifyJWT, control.createOrganization);
    app.put('/service/campaign/createConfigForm/:id', JWT.verifyJWT, control.createConfigForm);
    // app.delete('/service/organizations/:id', JWT.verifyJWT, control.deleteOrganization);
}