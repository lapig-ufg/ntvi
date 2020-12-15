module.exports = function (app) {
    const control = app.controllers.satellite;
    const JWT = app.middleware.jwt;

    app.get('/service/satellites', JWT.verifyJWT, control.getAllSatellites);
    app.get('/service/satellites/:id', JWT.verifyJWT, control.getSatellite);
    app.post('/service/satellites', JWT.verifyJWT, control.createSatellite);
    app.put('/service/satellites/:id', JWT.verifyJWT, control.updateSatellite);
    app.delete('/service/satellites/:id', JWT.verifyJWT, control.deleteSatellite);
}