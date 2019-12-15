"use strict";

const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.getUserList = query => {
	return new Promise((resolve, reject) => {
		getDB()
			.createCollection("users")
			.then(userCollection => {
				userCollection
					.find(
						{},
						{
							projection: {
								name: 1,
								mobile: 1,
								email: 1,
								account_create_date: 1,
								account_active: 1,
								account_disable: 1,
								account_delete: 1,
								account_activation_end_date: 1,
								trial: 1
							},
							skip: parseInt(query.start),
							limit: parseInt(query.length)
						}
					)
					.toArray()
					.then(async result => {
						try {
							resolve({
								data: result,
								recordsTotal: await userCollection.find({}).count(),
								recordsFiltered: await userCollection.find({}).count()
							});
						} catch (err) {
							reject(err);
						}
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
