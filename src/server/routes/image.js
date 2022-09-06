import string from "../libs/util/String";
import file from "../libs/util/File";

module.exports = function (app) {
	const image = app.controllers.image;

	app.get('/service/image/:layerId/:pointId/:campaignId/:index', image.access);
	app.get('/service/la_timelapse/:pointId/:campaignId/:index', image.la_timelapse);
	app.get('/service/pl_timelapse/:pointId/:campaignId/:index', image.pl_timelapse);
	app.get('/service/s2_timelapse/:pointId/:campaignId/:index', image.s2_timelapse);
}