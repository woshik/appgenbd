"use strict";

const { getDB } = require(join(BASE_DIR, "db", "database"));
const { ObjectId } = require("mongodb");

exports.checkAppIsActive = (appId, userId) => {
	return new Promise((resolve, reject) => {
		try {
			appId = ObjectId(appId);
		} catch (error) {
			return resolve(false);
		}

		getDB()
			.collection("app")
			.findOne(
				{
					_id: appId,
					user_id: userId,
					app_active: true
				},
				{
					projection: {
						_id: 1
					}
				}
			)
			.then(result => {
				resolve(!!result ? true : false);
			})
			.catch(err => reject(err));
	});
};
