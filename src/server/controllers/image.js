import string from "../libs/util/String";
import file from "../libs/util/File";

const moment = require('moment');
const path = require('path');
const base = require('app-root-path');
const spawn = require('child_process').spawn;

module.exports = function (app) {
    let Image = {};

    const campaigns = app.repository.collections.campaign;
    const mosaics = app.repository.collections.mosaics;
    const points = app.repository.collections.points;

    const config = app.config;

    // Image.access = function(request, response) {
    // 	let { layerId, pointId, campaignId } = request.params
    //
    // 	const sourceUrl = `http://localhost:${config.port}/source/${layerId}?campaign=${campaignId}`
    //
    // 	points.findOne({ _id: pointId }, function(err, point) {
    //
    // 		if (point) {
    //
    // 			const imagePath = path.join(config.imgDir, point.campaign, pointId, layerId +'.png')
    //
    // 			fs.exists(imagePath, function(exists) {
    // 				if (exists) {
    // 					response.sendFile(imagePath)
    // 				} else {
    //
    // 					const buffer = 4000
    // 					const coordinates = proj4('EPSG:4326', 'EPSG:900913', [point.lon, point.lat])
    //
    // 					const ulx = coordinates[0] - buffer
    // 					const uly = coordinates[1] + buffer
    // 					const lrx = coordinates[0] + buffer
    // 					const lry = coordinates[1] - buffer
    // 					const projwin = ulx + " " + uly + " " + lrx + " " + lry
    //
    // 					const cmd = config.imgDownloadCmd + ' "' + sourceUrl + '" "' + projwin + '" ' + imagePath
    //
    // 					console.log(cmd)
    //
    // 					exec(cmd, function() {
    // 						response.sendFile(imagePath)
    // 					})
    // 				}
    // 			})
    //
    // 		} else {
    // 			response.end()
    // 		}
    //
    // 	})
    // }

    Image.access = async function (request, response) {

        let {layerId, pointId, campaignId, index} = request.params;

        const point = await points.findOne({campaignId: parseInt(campaignId), index: parseInt(index)});
        const mosaic = await mosaics.findOne({_id: layerId});

        let errors = [];
        const imgDir = process.env.NODE_ENV === 'dev' ? base.path + process.env.IMG_DIR : process.env.IMG_DIR;
        const imgDownloadCmd = base.path + process.env.IMG_DOWN_CMD;

        const campaignNameNormalized = string.normalize(point.campaign);
        const imagePath = path.join(imgDir, campaignNameNormalized, pointId, mosaic._id + '.png');

        file.exists(imagePath).then(result => {
            if (result) {
                response.sendFile(imagePath)
            } else {
                const mosaicsPromises = new Promise((resolve, reject) => {
                    try {
                        let zoom = 12;

                        if (mosaic._id.includes('PL')) {
                            zoom = 14.6;
                        } else if (mosaic._id.includes('S2')) {
                            zoom = 13.6;
                        }

                        const child = spawn(imgDownloadCmd, [mosaic.url, point.lat + " " + point.lon, zoom, imagePath, mosaic._id]);

                        child.stderr.on('data', (data) => {
                            errors.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss') + " ]" + " - " + data);
                        });
                        child.on('error', (error) => {
                            errors.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss') + " ]" + " - " + error.message);
                        });
                        child.on('close', (code) => {
                            if (code === 0) {
                                resolve(true)
                            } else {
                                reject(errors)
                            }
                        });

                    } catch (e) {
                        reject(e)
                    }
                });
                mosaicsPromises.then((result) => {
                    if (result) {
                        response.sendFile(imagePath)
                    }
                }).catch(error => {
                    response.status(400).json({status: 400, message: error.message});
                    response.end();
                });
            }
        });

    }

    Image.la_timelapse = async function (request, response) {

        let {pointId, campaignId, index} = request.params;

        const point = await points.findOne({campaignId: parseInt(campaignId), index: parseInt(index)});

        const imgDir = process.env.NODE_ENV === 'dev' ? base.path + process.env.IMG_DIR : process.env.IMG_DIR;

        const campaignNameNormalized = string.normalize(point.campaign);

        const imagePath = path.join(imgDir, campaignNameNormalized, pointId, 'la_timelapse.gif');

        file.exists(imagePath).then(result => {
            if (result) {
                response.sendFile(imagePath)
            } else {
                response.status(400).json(false);
                response.end();
            }
        });

    }
    Image.pl_timelapse = async function (request, response) {

        let {pointId, campaignId, index} = request.params;

        const point = await points.findOne({campaignId: parseInt(campaignId), index: parseInt(index)});

        const imgDir = process.env.NODE_ENV === 'dev' ? base.path + process.env.IMG_DIR : process.env.IMG_DIR;

        const campaignNameNormalized = string.normalize(point.campaign);

        const imagePath = path.join(imgDir, campaignNameNormalized, pointId, 'pl_timelapse.gif');

        file.exists(imagePath).then(result => {
            if (result) {
                response.sendFile(imagePath)
            } else {
                response.status(400).json(false);
                response.end();
            }
        });

    }
    Image.s2_timelapse = async function (request, response) {

        let {pointId, campaignId, index} = request.params;

        const point = await points.findOne({campaignId: parseInt(campaignId), index: parseInt(index)});

        const imgDir = process.env.NODE_ENV === 'dev' ? base.path + process.env.IMG_DIR : process.env.IMG_DIR;

        const campaignNameNormalized = string.normalize(point.campaign);

        const imagePath = path.join(imgDir, campaignNameNormalized, pointId, 's2_timelapse.gif');

        file.exists(imagePath).then(result => {
            if (result) {
                response.sendFile(imagePath)
            } else {
                response.status(400).json(false);
                response.end();
            }
        });

    }

    return Image;

}
