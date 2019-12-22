"use strict";

const dateTime = require("date-and-time");
const { randomBytes } = require("crypto");
const { hashPassword } = require(join(BASE_DIR, "core", "util"));
const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.registration = userInfo => {
	return new Promise(async (resolve, reject) => {
		try {
			let _userDB = await getDB().collection("users");
			let userData = await _userDB.findOne(
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
			);

			if (!!userData) {
				return resolve({
					success: false,
					info: "This user already registered. One email address & mobile number use only once."
				});
			}

			let hashedPassword = await hashPassword(userInfo.password);

			let now = dateTime.addHours(new Date(), 6),
				bdNowWithDate = dateTime.format(now, "YYYY-MM-DD"),
				refreshToken = now.setMinutes(now.getMinutes() + 10);

			now.setMinutes(now.getMinutes() - 10);

			let rd = `${randomBytes(4).toString("hex")}${dateTime.format(now, "DD")}ace${dateTime.format(now, "MM")}${now.setMinutes(now.getMinutes() + 30)}`,
				token = randomBytes(3).toString("hex");

			now.setMinutes(now.getMinutes() - 30);

			_userDB.insertOne({
				userRDId: rd,
				name: userInfo.name,
				mobile: userInfo.mobile_number,
				email: userInfo.email,
				password: hashedPassword,
				token: token,
				token_refresh: refreshToken,
				account_activation_start_date: bdNowWithDate,
				account_activation_end_date: bdNowWithDate,
				account_create_date: dateTime.format(now, "DD-MM-YYYY hh:mm:ss A")
			});

			return resolve({
				success: true,
				info: {
					email: userInfo.email,
					rd: rd,
					token: token
				}
			});
		} catch (error) {
			return reject(error);
		}
	});
};
