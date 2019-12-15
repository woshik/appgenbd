"use strict";

const dateTime = require("date-and-time");
const { randomBytes } = require("crypto");
const { hashPassword } = require(join(BASE_DIR, "core", "util"));
const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.registration = userInfo => {
	return new Promise((resolve, reject) => {
		getDB()
			.createCollection("users")
			.then(userCollection => {
				userCollection
					.findOne(
						{
							$or: [
								{
									email: userInfo.email
								},
								{
									mobile: userInfo.mobile_number
								}
							]
						},
						{
							projection: {
								_id: 1
							}
						}
					)
					.then(id => {
						if (!!id) {
							return resolve({
								success: false,
								info: "This user already registered. One email address & mobile number use only once."
							});
						} else {
							hashPassword(userInfo.password)
								.then(passwordHashed => {
									let now = dateTime.addHours(new Date(), 6),
										now2 = now,
										bdNowWithDate = dateTime.format(now, "YYYY-MM-DD"),
										timeStamp = now2.setMinutes(now2.getMinutes() + 10);

									userCollection
										.insertOne({
											userRDId: `${randomBytes(4).toString("hex")}${dateTime.format(now, "DD")}ace${dateTime.format(now, "MM")}${now2.setMinutes(now2.getMinutes() + 20)}`,
											name: userInfo.name,
											mobile: userInfo.mobile_number,
											email: userInfo.email,
											password: passwordHashed,
											token: randomBytes(3).toString("hex"),
											token_refresh: timeStamp,
											account_activation_start_date: bdNowWithDate,
											account_activation_end_date: bdNowWithDate,
											account_create_date: dateTime.format(now, "DD-MM-YYYY hh:mm:ss A"),
											trial: true
										})
										.then(result =>
											resolve({
												success: true,
												info: {
													email: result.ops[0].email,
													rd: result.ops[0].userRDId,
													token: result.ops[0].token
												}
											})
										)
										.catch(err => reject(err));
								})
								.catch(err => reject(err));
						}
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
