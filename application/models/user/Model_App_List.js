"use strict";

const { getDB } = require(join(BASE_DIR, "db", "database"));
const { ObjectId } = require("mongodb");

exports.getAppList = (query, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let order = ["app_name", "app_id", "subscribe", "dial", "create_date", "app_active"];
			let sort = {};
			let appCollection = await getDB().collection("app");

			if (query.order) {
				sort[order[parseInt(query.order[0].column)]] = query.order[0].dir === "asc" ? 1 : -1;
			} else {
				sort[order[0]] = 1;
			}

			let where = {
				user_id: userId,
				$or: [
					{
						app_name: RegExp(`.*${query.search.value}.*`, "i")
					},
					{
						app_id: RegExp(`.*${query.search.value}.*`, "i")
					}
				]
			};

			let appData = await appCollection
				.find(where, {
					projection: {
						user_id: 0,
						app_serial: 0
					},
					skip: parseInt(query.start),
					limit: parseInt(query.length),
					sort: sort
				})
				.toArray();

			return resolve({
				list: appData,
				recordsTotal: await appCollection.countDocuments({ user_id: userId }),
				recordsFiltered: await appCollection.countDocuments(where)
			});
		} catch (err) {
			return reject(err);
		}
	});
};

exports.updateAppInfo = (appInfo, appId, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			appId = ObjectId(appId);
		} catch (error) {
			return resolve({
				success: false,
				message: "App name not found."
			});
		}

		try {
			let appCollection = await getDB().collection("app");

			let appData = await appCollection.findOne(
				{
					_id: appId,
					user_id: userId
				},
				{
					projection: {
						provider_id: 1,
						provider_password: 1
					}
				}
			);

			if (!!appData.provider_id && !!appData.provider_password) {
				return resolve({
					success: false,
					message: "You already fillup app id & app password. "
				});
			}

			await appCollection.updateOne(
				{
					_id: appData._id,
					user_id: userId
				},
				{
					$set: {
						provider_id: appInfo.appId,
						provider_password: appInfo.appPassword,
						app_active: true
					}
				}
			);

			return resolve({
				success: true,
				message: "Your app is successfully updated."
			});
		} catch (err) {
			return reject(err);
		}
	});
};

exports.updateAppStatus = (appId, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			appId = ObjectId(appId);
		} catch (error) {
			return resolve({
				success: false,
				message: "App name not found."
			});
		}

		try {
			let appCollection = await getDB().createCollection("app");

			let appData = await appCollection.findOne(
				{
					_id: appId,
					user_id: userId
				},
				{
					projection: {
						app_active: 1
					}
				}
			);

			await appCollection.updateOne(
				{
					_id: appData._id
				},
				{
					$set: {
						app_active: !appData.app_active
					}
				}
			);

			return resolve({
				success: true,
				message: "Your app status is changed."
			});
		} catch (err) {
			return reject(err);
		}
	});
};

exports.deleteApp = (appId, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			appId = ObjectId(appId);
		} catch (error) {
			return resolve({
				success: false,
				message: "App name not found."
			});
		}

		try {
			await getDB()
				.collection("app")
				.deleteMany({
					_id: appId,
					user_id: userId
				});

			await getDB()
				.collection("app.content")
				.deleteMany({
					app_id: appId,
					user_id: userId
				});

			return resolve({
				success: true,
				message: "Your app successfully deleted."
			});
		} catch (err) {
			return reject(err);
		}
	});
};
