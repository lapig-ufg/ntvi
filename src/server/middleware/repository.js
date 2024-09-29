const { MongoClient } = require('mongodb');
const { PrismaClient } = require('@prisma/client')
const async = require('async');

module.exports = function(app) {
	const config = app.config;
	let Repository = {
		collections: {},
		db: {},
		dbLogs: {},
		prisma: {},
		token: {},
	};

	const uri = `mongodb://${config.mongo.host}:${config.mongo.port}/?poolSize=20&writeConcern=majority`;

	Repository.client = MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	Repository.init = function(callback) {
		Repository.prisma = new PrismaClient();
		Repository.client.connect((err, client) => {
			if (err) {
				return callback(err);
			}

			Repository.db = client.db(config.mongo.dbname);
			Repository.dbLogs = client.db(config.mongo.logsDbname);

			Repository.db.listCollections().toArray((err, collection) => {
				if (err) {
					return callback(err);
				}
				const forEachOne = function(collection, callback) {
					const name = collection.name.substr(collection.name.indexOf('\.') + 1);
					if (name != 'indexes') {
						Repository.db.collection(name, function(err, repository) {
							if (err) {
								console.log(err);
							}
							Repository.collections[name] = repository;
							callback();
						});
					} else {
						callback();
					}
				};
				async.each(collection, forEachOne, callback);
			});
		});
	};

	Repository.getSync = function(collectionName) {
		return Repository.collections[collectionName];
	};

	Repository.get = function(collectionName, callback) {
		Repository.db.collection(collectionName, callback);
	};

	Repository.listenLogs = function() {

		Repository.prisma.$on('query', async log => {
			log['user'] =  Repository.token;
			await Repository.dbLogs.collection('queries').insertOne( log );
		})

		Repository.prisma.$on('error', async log => {
			log['user'] =  Repository.token;
			await Repository.dbLogs.collection('errors').insertOne( log );
		})
	};
	return Repository;
};
