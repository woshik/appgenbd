"use strict";

const config = require("config");
const { logger } = require(join(BASE_DIR, "core", "util"));
const MongoClient = require("mongodb").MongoClient;

let _db, _client;

exports.mongoClient = new Promise((resolve, reject) => {
	MongoClient.connect(config.get("database_connection_string"), {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
		.then(client => {
			_client = client;
			_db = client.db("appgenbd");
			resolve();
		})
		.catch(err => reject(err));
});

exports.getDB = () => {
	if (_db) {
		return _db;
	}
	logger.error("database not found");
};

exports.getClient = () => {
	if (_client) {
		return _client;
	}
	logger.error("database not found");
};
