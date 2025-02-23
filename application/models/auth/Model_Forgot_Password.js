"use strict";

const dateTime = require("date-and-time");
const { accountActivation } = require(join(BASE_DIR, "urlconf/webRule"));
const { randomBytes } = require("crypto");
const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.checkEmail = email => {
	return new Promise((resolve, reject) => {
		getDB()
			.createCollection("users")
			.then(userCollection => {
				userCollection
					.findOne(
						{
							email: email
						},
						{
							projection: {
								account_active: 1,
								token_refresh: 1,
								userRDId: 1
							}
						}
					)
					.then(user => {
						if (!user) {
							resolve({
								success: false,
								info: "Account not found."
							});
						} else if (!user.account_active) {
							if (!!user.userRDId && checkRDParam(user.userRDId, false)) {
								return resolve({
									success: false,
									info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${user.userRDId}">click here</a>`
								});
							} else {
								updateRDParam(userCollection, user._id, false)
									.then(rd => {
										return resolve({
											success: false,
											info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${rd}">click here</a>`
										});
									})
									.catch(err => reject(err));
							}
						} else {
							if (!!user.userRDId && checkRDParam(user.userRDId, true)) {
								return resolve({
									success: true,
									info: {
										email: email,
										rd: user.userRDId
									}
								});
							} else {
								updateRDParam(userCollection, user._id, true)
									.then(rd => {
										return resolve({
											success: true,
											info: {
												email: email,
												rd: rd
											}
										});
									})
									.catch(err => reject(err));
							}
						}
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};

function checkRDParam(rd, forgotRd) {
	let now = dateTime.addHours(new Date(), 6);
	return rd.slice(15) > now.getTime() && rd.slice(8, 15) === `${dateTime.format(now, "DD")}${forgotRd ? "abd" : "ace"}${dateTime.format(now, "MM")}`;
}

function updateRDParam(userCollection, id, forgotRd) {
	return new Promise((resolve, reject) => {
		let now = dateTime.addHours(new Date(), 6),
			rd = `${randomBytes(4).toString("hex")}${dateTime.format(now, "DD")}${forgotRd ? "abd" : "ace"}${dateTime.format(now, "MM")}${now.setMinutes(now.getMinutes() + 30)}`;

		userCollection
			.updateOne(
				{
					_id: id
				},
				{
					$set: {
						userRDId: rd
					}
				}
			)
			.then(updateInfo => resolve(rd))
			.catch(err => reject(err));
	});
}
