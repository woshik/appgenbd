"use strict";

const Joi = require("@hapi/joi");
const schema = Joi.object({
	version: Joi.string().required(),
	applicationId: Joi.string().required(),
	sessionId: Joi.string().required(),
	ussdOperation: Joi.string()
		.pattern(/^(mo-init|mo-cont)$/)
		.required(),
	sourceAddress: Joi.string()
		.pattern(/^tel:/)
		.required(),
	encoding: Joi.string().required(),
	requestId: Joi.string().required()
});
const axios = require("axios");
const config = require("config");
const dateTime = require("date-and-time");
const { logger } = require(join(BASE_DIR, "core", "util"));
const { getDB } = require(join(BASE_DIR, "db", "database"));
const { storageInstance } = require(join(BASE_DIR, "core", "sessionStore"));

var userResponse = null;
var userRequest = null;
var sessionData = null;

exports.ussd = async (req, res) => {
	const validateResult = schema.validate({
		version: req.body.version,
		applicationId: req.body.applicationId,
		sessionId: req.body.sessionId,
		ussdOperation: req.body.ussdOperation,
		sourceAddress: req.body.sourceAddress,
		encoding: req.body.encoding,
		requestId: req.body.requestId
	});

	if (validateResult.error) {
		return res.status(400).json({
			statusCode: "E1312",
			statusDetail: "Invalid Request."
		});
	}

	userRequest = validateResult.value;

	startSession()
		.resolve(() => {
			if (sessionData === [] && userRequest.ussdOperation === "mo-cont") {
				return res.status(400).json({
					statusCode: "E1312",
					statusDetail: "Invalid Request."
				});
			}
		})
		.catch(() => {
			return res.status(500).json({
				statusCode: "E1000",
				statusDetail: "App fail to process request."
			});
		});

	try {
		const _appDB = await getDB().collection("app");
		const appData = await _appDB.findOne(
			{
				app_serial: req.params.serial,
				app_name: req.params.appName,
				provider_id: userRequest.applicationId
			},
			{
				projection: {
					provider_password: 1,
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

		const _userDB = await getDB().collection("users");
		const userData = await _userDB.findOne(
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

		if (userRequest.ussdOperation === "mo-init") {
			const _subscriberDB = await getDB().collection("subscribers");
			const subscriberData = await _subscriberDB.findOne({
				source_address: userRequest.sourceAddress,
				provider_id: userRequest.applicationId
			});
			setSessionValue("isSubscribed", !!subscriberData);
			generateManu(!!subscriberData, userRequest.ussdOperation);
			mobileTerminatedContent(userRequest, appData);
		} else if (userRequest.ussdOperation === "mo-cont") {
			selectManu();
		}
	} catch (error) {
		logger.error(err);
		return res.json({
			statusCode: "E1000",
			statusDetail: "App failed to process this request."
		});
	}
};

function mobileTerminatedInit(appData) {
	postRequest(config.get("server_api.ussd"), {
		applicationId: appData.provider_id,
		password: appData.provider_password,
		message: userResponse,
		sessionId: userRequest.sessionId,
		ussdOperation: "mt-init",
		destinationAddress: userRequest.sourceAddress
	});
}

function mobileTerminatedContent(appData) {
	postRequest(config.get("server_api.ussd"), {
		applicationId: appData.provider_id,
		password: appData.provider_password,
		message: userResponse,
		sessionId: userRequest.sessionId,
		ussdOperation: "mt-cont",
		destinationAddress: userRequest.sourceAddress
	});
}

function mobileTerminatedFin(appData) {
	postRequest(config.get("server_api.ussd"), {
		applicationId: appData.provider_id,
		password: appData.provider_password,
		message: userResponse,
		sessionId: userRequest.sessionId,
		ussdOperation: "mt-fin",
		destinationAddress: userRequest.sourceAddress
	});
}

function generateManu(isSubscribed, ussdOperation) {
	userResponse = [];
	if (ussdOperation === "mo-init") {
		userResponse.push(`Thanks For Your Interest. Press 1 for ${isSubscribed ? "unsubscribe" : "subscribe"} this service.`);
	} else {
		userResponse.push("Invalid choice. Try again.");
	}
	isSubscribed ? userResponse.push("1. Unsubscribe") : userResponse.push("1. Subscribe");
	userResponse.push("2. Exit");
	userResponse = userResponse.join("\n");
}

function selectManu(appData) {
	switch (userRequest.message) {
		case "1":
			if (sessionData.isSubscribed) {
				userUnsubscribed(appData);
			} else {
				userSubscribed(appData);
			}
			userResponse = "Thank you for using our application.";
			mobileTerminatedFin(appData);
			break;
		case "2":
			userResponse = "Thank you for using our application.";
			mobileTerminatedFin(appData);
			break;
		default:
			generateManu(sessionData.isSubscribed, userRequest.ussdOperation);
	}
}

function startSession() {
	return new Promise((resolve, reject) => {
		let session = storageInstance();
		session.get(userRequest.sessionId, (err, data) => {
			if (err) return reject();
			if (!data) {
				session.set(userRequest.sessionId, null, err => {
					if (err) return reject();
				});
			} else {
				sessionData = data;
			}
			resolve();
		});
	});
}

function setSessionValue(key, value) {
	sessionData[key] = value;
	let session = storageInstance();
	session.touch(userRequest.sessionId, sessionData, callback);
}

async function userSubscribed(appData) {
	const _subscriberDB = await getDB().collection("subscribers");
	_subscriberDB.insertOne({
		app_id: appData._id,
		provider_id: appData.provider_id,
		source_address: userRequest.sourceAddress
	});
}

async function userUnsubscribed(appData) {
	const _subscriberDB = await getDB().collection("subscribers");
	_subscriberDB.deleteOne({
		app_id: appData._id,
		provider_id: appData.provider_id
	});
}

function postRequest(url = config.get("server_api.ussd"), data) {
	return new Promise((resolve, reject) => {
		axios
			.post(url, JSON.stringify(data), {
				headers: {
					"Content-Type": "application/json"
				}
			})
			.then(response => {
				resolve(response.data);
			})
			.catch(error => {
				reject(error);
			});
	});
}
