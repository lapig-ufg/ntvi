var appRoot = require('app-root-path');

module.exports = function (app) {
	//appRoot faz parte da documentação do js
	var appProducao = process.env.APP_PRODUCAO;

	var config = {
		"appRoot": appRoot,
		"clientDir": appRoot + process.env.CLIENT_DIR,
		"langDir": appRoot + process.env.LANG_DIR,
		"logDir": appRoot + process.env.LOGS_DIR,
		"imgDir": appRoot + process.env.IMG_DIR,
		"imgGDALTmpDir": appRoot + process.env.IMG_GDAL_TMP_DIR,
		"imgDownloadCmd": appRoot + process.env.IMG_DOWN_CMD,
		"cache": {
			"parallelRequestsBusyTime": process.env.PARALLEL_REQUEST_BUSY_TIME,
			"parallelRequestsDawnTime": process.env.PARALLEL_REQUEST_DAWN_TIME
		},
		"ndvi_domain": process.env.NDVI_DOMAIN,
		"pg": {
			"user": process.env.PG_USER,
			"host": process.env.PG_HOST,
			"database": process.env.PG_DATABASE,
			"password": process.env.PG_PASSWORD,
			"port": process.env.PG_PORT,
			"debug": process.env.PG_DEBUG,
			"max": 20,
			"idleTimeoutMillis": 0,
			"connectionTimeoutMillis": 0,
			"url": process.env.DATABASE_URL
		},
		"prismaOpts": {
			errorFormat: 'pretty',
			log: ['query'],
			__internal:{
				useUds: true
			}
		},
		"mongo": {
			"host": process.env.MONGO_HOST,
			"port": process.env.MONGO_PORT,
			"dbname": process.env.MONGO_DATABASE,
			"url": process.env.MONGO_URL,
			"logsDbname": process.env.MONGO_DATABASE_LOGS
		},
		"jobs": {
			"timezone": process.env.JOBS_TIME_ZONE,
			"toRun": [
				{
					"name": "publishLayers",
					"cron": '0 0 19 * * *',
					"runOnAppStart": false,
					"params": {
						"cmd": "python " + appRoot + "/integration/py/publish_layers.py",
						"keys": [
							{
								"file": appRoot + "/integration/py/gee-keys/key85.json",
								"startYear": 1985
							},
							{
								"file": appRoot + "/integration/py/gee-keys/key86.json",
								"startYear": 1986
							},
							{
								"file": appRoot + "/integration/py/gee-keys/key87.json",
								"startYear": 1987
							}
						]
					}
				},
				{
					"name": "populateCache",
					"cron": '0 0 20 1 0 *',
					"runOnAppStart": false,
					"params": {}
				}
			]
		},
		"port": process.env.APP_PORT,
	};

	if (process.env.NODE_ENV == 'prod') {
		config["mongo"]["port"] = process.env.MONGO_PORT;
		config.jobs.toRun[0].runOnAppStart = process.env.PUBLISH_LAYERS;
		config.jobs.toRun[1].runOnAppStart = process.env.START_CACHE;
		config["imgDir"] = process.env.IMG_DIR;
		config["prismaOpts"] = {
			__internal:{
				useUds: true
			},
			errorFormat: 'pretty',
			log: [
				{ level: 'query', emit: 'event' },
				{ level: 'error', emit: 'event' },
			],
		}
	}

	return config;

}
