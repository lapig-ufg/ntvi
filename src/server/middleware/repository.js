const { MongoClient } = require('mongodb')
const async = require('async');

module.exports = function(app) {
	const config = app.config;
	let Repository = {
		db: {},
		collections: {}
	};
	const uri = `mongodb://${config.mongo.host}:${config.mongo.port}/?poolSize=20&writeConcern=majority`;

	Repository.client = MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	Repository.init = function(callback) {

		Repository.client.connect((err,  client) => {
			if (err) {
				return callback(err);
			}
			Repository.db = client.db(config.mongo.dbname);

			Repository.db.listCollections().toArray((err, collection) => {
				if (err) {
					return callback(err);
				}
				const forEachOne = function(collection, callback) {
					const name = collection.name.substr(collection.name.indexOf('\.') + 1);
					if(name != 'indexes') {
						Repository.db.collection(name, function(err, repository) {
							if(err){
								console.log(err)
							}
							Repository.collections[name] = repository;
							callback();
						});
					} else {
						callback();
					}
				};
				async.each(collection, forEachOne, callback)
			});
		})
	};

	Repository.getSync = function(collectionName) {
		return Repository.collections[collectionName];
	};

	Repository.get = function(collectionName, callback) {
		Repository.db.collection(collectionName, callback);
	};

	return Repository;
};