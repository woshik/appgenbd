"use strict";

const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.getSettingData = () => {
	return new Promise((resolve, reject) => {
		getDB()
			.collection("setting")
			.findOne({})
			.then(data =>
				resolve({
					maxApp: data.max_app_can_install,
					costPerMonth: data.cost_par_month
				})
			)
			.catch(err => reject(err));
	});
};

exports.appSetting = settingData => {
	return new Promise((resolve, reject) => {
		getDB()
			.createCollection("setting")
			.then(settingCollection => {
				settingCollection
					.findOne(
						{},
						{
							_id: 1
						}
					)
					.then(getData => {
						if (getData) {
							settingCollection
								.updateOne(
									{
										_id: getData._id
									},
									{
										$set: {
											max_app_can_install: settingData.maxAppCanInstall,
											cost_par_month: settingData.costPerMonth
										}
									}
								)
								.then(data =>
									resolve({
										success: true,
										info: data
									})
								)
								.catch(err => reject(err));
						} else {
							settingCollection
								.insertOne({
									max_app_can_install: settingData.maxAppCanInstall,
									cost_par_month: settingData.costPerMonth
								})
								.then(data =>
									resolve({
										success: true,
										info: data.ops[0]
									})
								)
								.catch(err => reject(err));
						}
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
