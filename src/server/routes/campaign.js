module.exports = function (app) {
    const control = app.controllers.campaign;
    const JWT = app.middleware.jwt;

    app.post('/service/campaign/create', JWT.verifyJWT, control.createCampaignInfoForm);
    app.put('/service/campaign/updateInfoForm/:id', JWT.verifyJWT, control.updateCampaignInfoForm);
    // app.get('/service/organizations/:id', JWT.verifyJWT, control.getOrganization);
    // app.post('/service/organizations', JWT.verifyJWT, control.createOrganization);
    app.put('/service/campaign/createConfigForm/:id', JWT.verifyJWT, control.createConfigForm);
    app.put('/service/campaign/updateConfigForm/:id', JWT.verifyJWT, control.updateConfigForm);
    app.put('/service/campaign/createPointsForm/:id', JWT.verifyJWT, control.createPointsForm);
    app.put('/service/campaign/updatePointsForm/:id', JWT.verifyJWT, control.updatePointsForm);
    app.put('/service/campaign/createUsersCampaignForm/:id', JWT.verifyJWT, control.createUserCampaignForm);
    app.put('/service/campaign/updateUsersCampaignForm/:id', JWT.verifyJWT, control.updateUserCampaignForm);
    app.put('/service/campaign/createImagesForm/:id', JWT.verifyJWT, control.createImagesForm);
    app.put('/service/campaign/updateImagesForm/:id', JWT.verifyJWT, control.updateImagesForm);
    // app.delete('/service/organizations/:id', JWT.verifyJWT, control.deleteOrganization);
}