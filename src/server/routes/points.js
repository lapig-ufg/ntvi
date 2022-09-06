module.exports = function (app) {

	const jwt = app.middleware.jwt;
	var points = app.controllers.points;


	app.get('/service/points/next-point', jwt.verifyJWT, points.getCurrentPoint);

	app.get('/service/points/:campaignId', jwt.verifyJWT, points.getPoints);
	app.get('/service/points/camp/:campaignId', jwt.verifyJWT, points.getCampaign);
	app.get('/service/points/info/:campaignId', jwt.verifyJWT, points.getPoints);
	app.get('/service/points/:campaignId/:pointId', jwt.verifyJWT, points.getPoint);
	app.post('/service/points/results', jwt.verifyJWT, points.getResults);
	app.post('/service/points/update-point', jwt.verifyJWT, points.updatePoint);

}