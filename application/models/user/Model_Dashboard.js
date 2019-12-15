"use strict";

const { compare } = require("bcryptjs");
const { getDB } = require(join(BASE_DIR, "db", "database"));
const { hashPassword } = require(join(BASE_DIR, "core", "util"));

exports.passwordChange = (newInfo, id) => {
	return new Promise((resolve, reject) => {
		getDB()
			.createCollection("users")
			.then(userCollection => {
				userCollection
					.findOne(
						{
							_id: id
						},
						{
							projection: {
								password: 1
							}
						}
					)
					.then(user => {
						if (!user) {
							return resolve({
								success: false,
								info: "User not found."
							});
						}

						compare(newInfo.current_password, user.password)
							.then(isMatch => {
								if (isMatch) {
									hashPassword(newInfo.new_password)
										.then(passwordHashed => {
											userCollection
												.updateOne(
													{
														_id: id
													},
													{
														$set: {
															name: newInfo.name,
															password: passwordHashed
														}
													}
												)
												.then(userUpdateValue => {
													return resolve({
														success: true,
														message: "Successfully infomations updated."
													});
												})
												.catch(err => reject(err));
										})
										.catch(err => reject(err));
								} else {
									return resolve({
										success: false,
										message: "Current password is wrong."
									});
								}
							})
							.catch(err => reject(err));
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
