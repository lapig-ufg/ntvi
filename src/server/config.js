var appRoot = require('app-root-path');
const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
	throw result.error;
}
const { parsed: env } = result;

module.exports = function (app) {
	//appRoot faz parte da documentação do js

	var appProducao = env.APP_PRODUCAO;

	var config = {
		"appRoot": appRoot,
		"clientDir": appRoot + env.CLIENT_DIR,
		"langDir": appRoot + env.LANG_DIR,
		"logDir": appRoot + env.LOG_DIR,
		"imgDir": appRoot + env.IMG_DIR,
		"imgGDALTmpDir": appRoot + env.IMG_GDAL_TMP_DIR,
		"imgDownloadCmd": appRoot + env.IMG_DOWN_CMD,
		"cache": {
			"parallelRequestsBusyTime": 9,
			"parallelRequestsDawnTime": 18
		},
		"pg": {
			"user": env.PG_USER,
			"host": env.PG_HOST,
			"database": env.PG_DATABASE,
			"password": env.PG_PASSWORD,
			"port": env.PG_PORT,
			"debug": env.PG_DEBUG,
			"max": 20,
			"idleTimeoutMillis": 0,
			"connectionTimeoutMillis": 0,

		},
		"mongo": {
			"host": env.MONGO_HOST,
			"port": env.MONGO_PORT,
			"dbname": env.MONGO_DATABASE
		},
		"jobs": {
			"timezone": 'America/Sao_Paulo',
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
		"port": env.PORT,
	};

	if (process.env.NODE_ENV == 'prod') {
		config["mongo"]["port"] = env.MONGO_PORT_PROD;
		config.jobs.toRun[0].runOnAppStart = true;
		config.jobs.toRun[1].runOnAppStart = true;
		config["imgDir"] = env.IMG_DIR_PROD;
	}

	return config;

}
