"use strict";

const Joi = require("@hapi/joi");
const entities = new (require("html-entities").AllHtmlEntities)();
const dateTime = require("date-and-time");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const { user } = require(join(BASE_DIR, "urlconf", "sideBar"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));
const { checkAppIsActive } = require(join(MODEL_DIR, "user/Model_Content_Upload"));
const { getDB } = require(join(BASE_DIR, "db", "database"));
const { ObjectId } = require("mongodb");

exports.contentUploadView = (req, res, next) => {
	checkAppIsActive(req.query.appId, req.user._id)
		.then(success => {
			if (success) {
				return res.render("user/base-template", {
					layout: "content-upload",
					info: companyInfo,
					title: "Content Upload",
					path: "/user/app-list",
					sidebar: user,
					csrfToken: req.csrfToken(),
					userName: req.user.name,
					email: req.user.email,
					appId: req.query.appId,
					contentUploadFormURL: web.contentUpload.url,
					userProfileSettingURL: web.userProfileSetting.url
				});
			} else {
				req.flash("appListPageMessage", "App not found.");
				return res.redirect(web.appList.url);
			}
		})
		.catch(err => next(err));
};

exports.contentUpload = async (req, res, next) => {
	let message = req.body.messageContent;
	let messageDateTime = req.body.dateTime;
	let position = req.body.position;

	let appId = null;

	try {
		appId = ObjectId(req.body.appId);
	} catch (error) {
		return res.json({
			success: false,
			message: "App Not Found."
		});
	}

	if (typeof message === "undefined" || typeof messageDateTime === "undefined" || typeof position === "undefined") {
		return res.json({
			success: false,
			message: "Please don't edit anything yourself, you will be back listed."
		});
	}

	if (typeof position === "string") {
		message = [message];
		messageDateTime = [messageDateTime];
		position = [position];
	}

	if (message.length === messageDateTime.length && messageDateTime.length === position.length) {
		let length = message.length;

		var clientResponse = [];
		var appContentCollection = await getDB().createCollection("app.content");
		var appCollection = await getDB().createCollection("app");

		for (let i = 0; i < length; i++) {
			let result = new Promise((response, reject) => {
				const schema = Joi.object({
					messageDateTime: Joi.string()
						.trim()
						.required()
						.pattern(/^[0-3][0-9]-[0-1][0-9]-20[0-9]{2} [0-1][0-9]:00 (am|pm)$/)
						.label("Message receiving date time"),
					content: Joi.string()
						.trim()
						.required()
						.label("Message content")
				});

				const validateResult = schema.validate({
					messageDateTime: messageDateTime[i],
					content: entities.encode(message[i])
				});

				if (validateResult.error) {
					return response({
						success: false,
						position: parseInt(position[i]),
						message: fromErrorMessage(validateResult.error.details[0])
					});
				}

				let splitDateTime = messageDateTime[i].split(" ");
				let splitDate = splitDateTime[0].split("-");

				if (dateTime.subtract(new Date(`${splitDate[2]}-${splitDate[1]}-${splitDate[0]} ${splitDateTime[1]} ${splitDateTime[2]}`), dateTime.addHours(new Date(), 6)).toDays() <= 0) {
					return response({
						success: false,
						position: parseInt(position[i]),
						message: "You have to select a date which is grater than today."
					});
				}

				appCollection
					.findOne(
						{
							_id: appId,
							user_id: req.user._id,
							app_active: true
						},
						{
							projection: {
								_id: 1,
								provider_id: 1
							}
						}
					)
					.then(appData => {
						if (!appData) {
							return response({
								success: false,
								position: parseInt(position[i]),
								message: "App not found."
							});
						}

						appContentCollection
							.countDocuments({
								app_id: appData._id,
								date: `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`
							})
							.then(count => {
								if (!!count) {
									return response({
										success: false,
										position: parseInt(position[i]),
										message: `Already you uploaded a message for ${splitDateTime[0]}`
									});
								}

								appContentCollection
									.insertOne({
										app_id: appData._id,
										user_id: req.user._id,
										provider_id: appData.provider_id,
										date: `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`,
										time: `${splitDateTime[1]} ${splitDateTime[2]}`,
										message: validateResult.value.content
									})
									.then(data =>
										response({
											success: true,
											position: parseInt(position[i])
										})
									)
									.catch(err => reject(err));
							})
							.catch(err => reject(err));
					})
					.catch(err => reject(err));
			});

			await result.then(data => clientResponse.push(data)).catch(err => next(err));
		}

		return res.json(clientResponse);
	} else {
		return res.json({
			success: false,
			message: "Please don't edit anything yourself, you will be back listed."
		});
	}
};
