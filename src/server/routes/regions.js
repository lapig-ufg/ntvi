module.exports = function (app) {

    const regions = app.controllers.regions;

    app.get('/service/region/:lon/:lat', regions.getRegionInfo);
}