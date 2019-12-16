"use strict";

const dateTime = require("date-and-time");
const { ObjectId } = require("mongodb");
const { randomBytes } = require("crypto");
const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.insertAppName = (appName, userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			let appData = await getDB()
				.collection("app")
				.insertOne({
					user_id: userID,
					app_name: appName,
					app_serial: `${randomBytes(4).toString("hex")}${new Date().getTime()}`,
					create_date_time: dateTime.addHours(new Date(), 6),
					app_active: false
				});

			return resolve({
				success: true,
				info: {
					appId: appData.ops[0]._id,
					serial: appData.ops[0].app_serial
				}
			});
		} catch (error) {
			return reject(error);
		}
	});
};

exports.installApp = (appInfo, appId, userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			appId = ObjectId(appId);
		} catch (error) {
			return resolve({
				success: false,
				info: "App name not found."
			});
		}

		try {
			let updateInfo = await getDB()
				.collection("app")
				.updateOne(
					{
						_id: appId,
						user_id: userID
					},
					{
						$set: {
							provider_id: appInfo.providerId,
							provider_password: appInfo.providerPassword,
							app_active: true
						}
					}
				);

			if (!updateInfo.modifiedCount) {
				return resolve({
					success: false,
					info: "Fail to install you app. Please try again."
				});
			} else {
				return resolve({
					success: true,
					info: null
				});
			}
		} catch (error) {
			return reject(error);
		}
	});
};
