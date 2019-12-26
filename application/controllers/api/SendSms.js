"use strict";

const { getDB } = require(join(BASE_DIR, "db", "database"));
const dateTime = require("date-and-time");

exports.sendSms = (req, res, next) => {
	try {
        const _contentDB = await getDB().createCollection("app.content");
        const _subscribersDB = await getDB().createCollection("subscribers");

        const now = dateTime.addHours(new Date(), 6);

        now.getHours()

	} catch (error) {}
};
