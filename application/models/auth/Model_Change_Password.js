"use strict";

const dateTime = require("date-and-time");
const { hashPassword } = require(join(BASE_DIR, "core", "util"));
const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.checkUser = (email, rd) => {
	return new Promise((resolve, reject) => {
		getDB()
			.createCollection("users")
			.then(userCollection => {
				userCollection
					.findOne(
						{
							email: email,
							userRDId: rd
						},
						{
							projection: {
								account_active: 1,
								forget_password: 1
							}
						}
					)
					.then(user => {
						if (!user) {
							return resolve({
								success: false,
								info: "Account not found. Try again."
							});
						} else if (!user.account_active) {
							return resolve({
								success: false,
								info: "Your account not activated."
							});
						} else if (checkForgetPasswordTime(user.forget_password)) {
							return resolve({
								success: true,
								info: null
							});
						} else {
							return resolve({
								success: false,
								info: "Invalid request."
							});
						}
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};

exports.changePassword = (email, rd, password) => {
	return new Promise((resolve, reject) => {
		getDB()
			.createCollection("users")
			.then(userCollection => {
				userCollection
					.findOne(
						{
							email: email,
							userRDId: rd
						},
						{
							projection: {
								account_active: 1,
								forget_password: 1
							}
						}
					)
					.then(user => {
						if (!user) {
							return resolve({
								success: false,
								info: "Account not found. Try again."
							});
						} else if (!user.account_active) {
							return resolve({
								success: false,
								info: "Your account not activated."
							});
						} else if (checkForgetPasswordTime(user.forget_password)) {
							hashPassword(password)
								.then(passwordHashed => {
									userCollection
										.updateOne(
											{
												_id: user._id
											},
											{
												$set: {
													password: passwordHashed
												},
												$unset: {
													forget_password: null,
													userRDId: null
												}
											}
										)
										.then(result =>
											resolve({
												success: true,
												info: "Password successfully changed."
											})
										)
										.catch(err => reject(err));
								})
								.catch(err => reject(err));
						} else {
							return resolve({
								success: false,
								info: "Invalid request."
							});
						}
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};

function checkForgetPasswordTime(time) {
	return time > dateTime.addHours(new Date(), 6).getTime();
}
