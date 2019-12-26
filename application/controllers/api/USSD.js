"use strict";

const Joi = require("@hapi/joi");
const schema = Joi.object({
	applicationId: Joi.string().required(),
	ussdOperation: Joi.string()
		.pattern(/^(mo-init|mo-cont)$/)
		.required(),
	sourceAddress: Joi.string()
		.pattern(/^tel:/)
		.required(),
	message: Joi.string().required()
});
const axios = require("axios");
const config = require("config");
const dateTime = require("date-and-time");
const { logger } = require(join(BASE_DIR, "core", "util"));
const { getDB } = require(join(BASE_DIR, "db", "database"));

var _db = null,
	userResponse = null,
	userRequest = null,
	_appDB = null,
	isSubscribed = false,
	appData = null;

exports.ussd = async (req, res) => {
	const validateResult = schema.validate({
		applicationId: req.body.applicationId,
		ussdOperation: req.body.ussdOperation,
		sourceAddress: req.body.sourceAddress,
		message: req.body.message
	});

	if (validateResult.error) {
		return res.status(400).json({
			statusCode: "E1312",
			statusDetail: "Invalid Request."
		});
	}

	userRequest = validateResult.value;

	try {
		_db = getDB();
		_appDB = await _db.collection("app");
		appData = await _appDB.findOne(
			{
				app_serial: req.params.serial,
				app_name: req.params.appName,
				provider_id: userRequest.applicationId
			},
			{
				projection: {
					provider_id: 1,
					provider_password: 1,
					app_name: 1,
					user_id: 1
				}
			}
		);

		if (!appData) {
			return res.status(404).json({
				statusCode: "E1301",
				statusDetail: "App Not Available."
			});
		}

		const userData = await _db.collection("users").findOne(
			{
				_id: appData.user_id
			},
			{
				projection: {
					account_activation_end_date: 1,
					account_active: 1,
					account_disable: 1
				}
			}
		);

		if (!userData.account_active || !!userData.account_disable || !(dateTime.subtract(new Date(userData.account_activation_end_date), dateTime.addHours(new Date(), 6)).toDays() >= 0)) {
			return res.status(404).json({
				statusCode: "E1301",
				statusDetail: "App Not Available"
			});
		}

		isSubscribed = !!(await _db.collection("subscribers").findOne({
			app_id: appData._id,
			source_address: userRequest.sourceAddress,
			subscribe: true
		}));

		if (userRequest.ussdOperation === "mo-init") {
			generateManu();
			mobileTerminatedContent();

			_appDB.findOne(
				{
					_id: appData._id
				},
				{
					$inc: {
						dial: 1
					}
				}
			);
		} else {
			selectManu(appData);
		}

		return res.json({
			statusCode: "S1000",
			statusDetail: "Success"
		});
	} catch (err) {
		return res.status(500).json({
			statusCode: "E1000",
			statusDetail: "App failed to process this request."
		});
	}
};

function mobileTerminatedContent() {
	postRequest(config.get("server_api.ussd"), {
		applicationId: appData.provider_id,
		password: appData.provider_password,
		message: userResponse,
		sessionId: userRequest.sessionId,
		ussdOperation: "mt-cont",
		destinationAddress: userRequest.sourceAddress
	});
}

function mobileTerminatedFin() {
	postRequest(config.get("server_api.ussd"), {
		applicationId: appData.provider_id,
		password: appData.provider_password,
		message: userResponse,
		sessionId: userRequest.sessionId,
		ussdOperation: "mt-fin",
		destinationAddress: userRequest.sourceAddress
	});
}

function generateManu() {
	userResponse = [];
	if (userRequest.ussdOperation === "mo-init") {
		userResponse.push(`Thanks For Your Interest. Press 1 for ${isSubscribed ? "unsubscribe" : "subscribe"} this service.`);
	} else {
		userResponse.push("Invalid choice. Try again.");
	}
	isSubscribed ? userResponse.push("1. Unsubscribe") : userResponse.push("1. Subscribe");
	userResponse.push("2. Exit");
	userResponse = userResponse.join("\n");
}

function selectManu() {
	switch (userRequest.message) {
		case "1":
			if (isSubscribed) {
				userUnsubscribed();
			} else {
				userSubscribed();
			}
			userResponse = "Thank you for using our application.";
			sendConfirm();
			mobileTerminatedFin();
			break;
		case "2":
			userResponse = "Thank you for using our application.";
			mobileTerminatedFin();
			break;
		default:
			generateManu();
			mobileTerminatedContent();
	}
}

function userSubscribed() {
	getDB()
		.collection("subscribers")
		.insertOne({
			app_id: appData._id,
			provider_id: appData.provider_id,
			source_address: userRequest.sourceAddress,
			subscribe: true
		});

	_appDB.findOne(
		{
			_id: appData._id
		},
		{
			$inc: {
				subscribers: 1
			}
		}
	);
}

function userUnsubscribed() {
	getDB()
		.collection("subscribers")
		.updateOne(
			{
				app_id: appData._id,
				provider_id: appData.provider_id,
				source_address: userRequest.sourceAddress
			},
			{
				$set: {
					subscribe: false
				}
			}
		);

	_appDB.findOne(
		{
			_id: appData._id
		},
		{
			$inc: {
				subscribers: -1
			}
		}
	);
}

function sendConfirm() {
	postRequest(config.get("server_api.sms"), {
		applicationId: appData.provider_id,
		password: appData.provider_password,
		message: "Your are successfully subscribe",
		destinationAddresses: [].push(userRequest.sourceAddress),
		sourceAddress: appData.app_name
	});
}

function postRequest(url, data) {
	axios.post(url, JSON.stringify(data), {
		headers: {
			"Content-Type": "application/json"
		}
	});
}
