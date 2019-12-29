"use strict";

const { getDB, mongoClient } = require(join(BASE_DIR, "db", "database"));
const { logger } = require(join(BASE_DIR, "core", "util"));
const dateTime = require("date-and-time");


mongoClient.then(() => {

}).catch(err => logger.error(err));

module.exports = (req, res, next) => {
	try {
        const _contentDB = await getDB().createCollection("app.content");
        const _subscribersDB = await getDB().createCollection("subscribers");

        const now = dateTime.addHours(new Date(), 6);

        now.getHours()

	} catch (error) {}
};
