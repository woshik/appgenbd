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
			let appContentCollection = await getDB().collection("app.content");

			let order = ["date", "", "", "status"];
			let sort = {};

			if (query.order) {
				sort[order[parseInt(query.order[0].column)]] = query.order[0].dir === "asc" ? 1 : -1;
			} else {
				sort[order[0]] = 1;
			}

			let where = {
				app_id: appId,
				user_id: userId
			};

			if (query.search.value !== "") {
				let search = query.search.value.split("-");
				where.$or = [];
				where.$or.push({
					date: RegExp(`.*${search[0]}-${search[1]}-${search[2]}.*`, "i")
				});

				where.$or.push({
					date: RegExp(`.*${search[2]}-${search[1]}-${search[0]}.*`, "i")
				});
			}

			let contentList = await appContentCollection
				.find(where, {
					skip: parseInt(query.start),
					limit: parseInt(query.length),
					sort: sort
				})
				.toArray();

			return resolve({
				list: contentList,
				recordsTotal: await appContentCollection.countDocuments({ app_id: appId, user_id: userId }),
				recordsFiltered: await appContentCollection.countDocuments(where)
			});
		} catch (err) {
			return reject(err);
		}
	});
};

exports.getContent = (appContentId, appId, userId) => {
	return new Promise(async (resolve, reject) => {
		let contentId = null;
		let applicationId = null;
		try {
			contentId = ObjectId(appContentId);
			applicationId = ObjectId(appId);
		} catch (error) {
			return resolve({
				success: false,
				message: "App not found."
			});
		}

		try {
			let content = await getDB()
				.collection("app.content")
				.findOne(
					{
						_id: contentId,
						user_id: userId,
						app_id: applicationId
					},
					{
						projection: {
							_id: 0,
							message: 1
						}
					}
				);

			if (!content) {
				return resolve({
					success: false,
					message: "App not found."
				});
			} else {
				resolve({
					success: true,
					message: content.message
				});
			}
		} catch (error) {
			reject(error);
		}
	});
};

exports.updateMessageContent = (appContentId, appId, userId, message) => {
	return new Promise((resolve, reject) => {
		let contentId = null;
		let applicationId = null;
		try {
			contentId = ObjectId(appContentId);
			applicationId = ObjectId(appId);
		} catch (error) {
			return resolve({
				success: false,
				message: "App not found."
			});
		}

		try {
			getDB()
				.collection("app.content")
				.updateOne(
					{
						_id: contentId,
						user_id: userId,
						app_id: applicationId
					},
					{
						$set: {
							message: message
						}
					}
				);

			return resolve({
				success: true,
				message: "Successfully content is updated."
			});
		} catch (error) {
			reject(error);
		}
	});
};
