"use strict";

const { getDB } = require(join(BASE_DIR, "db", "database"));
const { ObjectId } = require("mongodb");

exports.checkAppIsActive = (appId, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			appId = ObjectId(appId);
		} catch (error) {
			return resolve({ success: false });
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
						_id: 1,
						app_serial: 1,
						app_name: 1
					}
				}
			)
			.then(result => {
				if (!result) {
					return resolve({
						success: false
					});
				} else {
					return resolve({
						success: true,
						info: result
					});
				}
			})
			.catch(err => reject(err));
	});
};

exports.getAppMessageContent = (query, userId) => {
	let appId = null;
	try {
		appId = ObjectId(query.appId);
	} catch (error) {
		return resolve({
			list: [],
			recordsTotal: 0
		});
	}

	return new Promise(async (resolve, reject) => {
		try {
			let appCollection = await getDB().collection("app.content");
			let where = {
				user_id: userId,
				app_id: appId,
				app_active: true
			};

			let appMessageContent = await appCollection.findOne(where, {
				projection: {
					_id: 1,
					content: {
						$slice: [parseInt(query.start), parseInt(query.length)]
					}
				}
			});

			return resolve({
				list: appMessageContent,
				recordsTotal: await appCollection.countDocuments(where)
			});
		} catch (err) {
			return reject(err);
		}
	});
};
