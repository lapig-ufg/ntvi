const fs = require('fs');
const exec = require('child_process').exec;
const proj4 = require('proj4');
const path = require('path');
const request = require('request');
const async = require('async');

module.exports = function(app) {
	
	let Image = {};
	let Internal = {};

	const campaigns = app.repository.collections.campaign;
	const mosaics = app.repository.collections.mosaics;
	const points = app.repository.collections.points;
	
	const config = app.config;

	Internal.TMSUrl = function(mosaicId, campaignId, callback) {
		campaigns.findOne({ "_id": campaignId }, function(err, campaign) {
			if (campaign !== undefined && campaign.customURLs !== undefined && campaign.customURLs[mosaicId] !== undefined) {
				callback(campaign.customURLs[mosaicId]);
			} else {
				mosaics.findOne({ "_id": mosaicId }, function(err, mosaic) {
					
					let url = undefined
					if(mosaic !== undefined) {
						const token = mosaic.ee_token;
						const mapid = mosaic.ee_mapid;
						url = "https://earthengine.googleapis.com/v1alpha/" + mapid + "/tiles/${z}/${x}/${y}"
					}

					callback(url);
				})
			}

		})
	}

	Internal.GDALWmsXmlResponse = function(mosaicId, campaignId, TMSurl) {
		return "\
<GDAL_WMS> \n\
    <Service name=\"TMS\"> \n\
        <ServerUrl>"+TMSurl+"</ServerUrl> \n\
    </Service> \n\
    <DataWindow> \n\
        <UpperLeftX>-20037508.34</UpperLeftX> \n\
        <UpperLeftY>20037508.34</UpperLeftY> \n\
        <LowerRightX>20037508.34</LowerRightX> \n\
        <LowerRightY>-20037508.34</LowerRightY> \n\
        <TileLevel>20</TileLevel> \n\
        <TileCountX>1</TileCountX> \n\
        <TileCountY>1</TileCountY> \n\
        <YOrigin>top</YOrigin> \n\
    </DataWindow> \n\
    <Cache> \n\
    	<Expires>1</Expires> \n\
    	<Path>"+config.imgGDALTmpDir+"/"+mosaicId+"_"+campaignId+"</Path> \n\
    </Cache> \n\
    <Projection>EPSG:900913</Projection> \n\
    <BlockSizeX>256</BlockSizeX> \n\
    <BlockSizeY>256</BlockSizeY> \n\
    <BandsCount>3</BandsCount> \n\
    <MaxConnections>10</MaxConnections> \n\
    <Cache /> \n\
</GDAL_WMS>"
	}

	Image.gdalDefinition = function(request, response) {
		const mosaicId = request.param('id')
		const campaignId = request.param('campaign')

		Internal.TMSUrl(mosaicId, campaignId, function(TMSurl) {
			if(TMSurl != undefined)
				response.write(Internal.GDALWmsXmlResponse(mosaicId, campaignId, TMSurl))

			response.end()
		});

	}

	Image.access = function(request, response) {
		const layerId = request.param('layerId')
		const pointId = request.param('pointId')
		const campaignId = request.param('campaign')

		const sourceUrl = `http://localhost:${config.port}/source/${layerId}?campaign=${campaignId}`
		
		points.findOne({ _id:pointId }, function(err, point) {

			if (point) {
				
				const imagePath = path.join(config.imgDir, point.campaign, pointId, layerId +'.png')

				fs.exists(imagePath, function(exists) {
					if (exists) {
						response.sendFile(imagePath)
					} else {

						const buffer = 4000
						const coordinates = proj4('EPSG:4326', 'EPSG:900913', [point.lon, point.lat])

						const ulx = coordinates[0] - buffer
						const uly = coordinates[1] + buffer
						const lrx = coordinates[0] + buffer
						const lry = coordinates[1] - buffer
						const projwin = ulx + " " + uly + " " + lrx + " " + lry

						const cmd = config.imgDownloadCmd + ' "' + sourceUrl + '" "' + projwin + '" ' + imagePath

						console.log(cmd)

						exec(cmd, function() {
							response.sendFile(imagePath)
						})
					}
				})

			} else {
				response.end()
			}

		})
	}

	Image.populateCache = function(requestPointCache, pointCacheCompĺete, finished) {

		const periods = ['DRY','WET']

 		const getRequestTasks = function(point, campaign) {

 			let satellite
 			const requestTasks = [];
 			const urls = [];
			
			const initialYear = campaign.initialYear;
			const finalYear = campaign.finalYear;

			periods.forEach(function(period){
				for (let year = initialYear; year <= finalYear; year++) {
			 				
	 				satellite = 'L7';

					if(year > 2012) { 
						satellite = 'L8'
					} else if(year > 2011) {
						satellite = 'L7'
					} else if(year > 2003  || year < 2000) {
						satellite = 'L5'
					}

					layerId = satellite+"_"+year+"_"+period
					pointId = point._id

					const url = "http://localhost:" + config.port + "/image/"+layerId+"/"+pointId+"?campaign="+campaign._id;
					urls.push(url);
				}
			});

			urls.forEach(function(url) {
				requestTasks.push(function(next) {
					const params = { timeout: 3600 * 1000 };
					const callback = function(error, response, html) {
						requestPointCache(point, url)
						if(error) {
							request(url, params, callback);
						} else {
				    	next();
						}
				  }
					request(url, params, callback);
				});
			});

			return requestTasks;
 		}

 		let cacheJobCanStopFlag = false;
 		const startCacheJob = function(next) {
	 		app.repository.collections.points.findOne({ "cached" : false }, { lon:1, lat: 1, campaign: 1}, { sort: [['index', 1]] }, function(err, point) {
	 			if(point) {
	 				app.repository.collections.campaign.findOne({ "_id" : point.campaign }, function(err, campaign) {
						const requestTasks = getRequestTasks(point, campaign);
						
						const hour = new Date().getHours()
						const day = new Date().getDay();
						const busyTimeCondition = ( (day == 6) || (day == 0) || (hour >= 8 && hour <= 19 ) )

						const parallelRequestsLimit = busyTimeCondition ? config.cache.parallelRequestsBusyTime : config.cache.parallelRequestsDawnTime;

						async.parallelLimit(requestTasks, parallelRequestsLimit, function() {
							app.repository.collections.points.update({ _id: point._id}, { '$set': { "cached": true }  }, {}, function() {
								pointCacheCompĺete(point._id);
								next();
							});
						});
	 				});
	 			} else {
	 				cacheJobCanStopFlag = true;
	 				next()
	 			}
	 		});
 		}

 		const cacheJobCanStop = function() {
 			return cacheJobCanStopFlag;
 		}

 		const onComplete = function() {
 			finished();
 		}

 		async.doUntil(startCacheJob, cacheJobCanStop, onComplete);

	}

	return Image;

}
