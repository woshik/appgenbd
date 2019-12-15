"use strict";

const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.checkAppIsActive = (appName, id) => {
	return new Promise(async (resolve, reject) => {
		getDB()
			.collection("app")
			.findOne(
				{
					user_id: id,
					app_name: appName,
					app_active: true
				},
				{
					_id: 1,
					app_serial: 1
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

exports.getAppMessageContent = (query, id) => {
	return new Promise(async (resolve, reject) => {
		try {
			let appCollection = await getDB().collection("app");
			let where = {
				user_id: id,
				app_name: query.appName,
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
