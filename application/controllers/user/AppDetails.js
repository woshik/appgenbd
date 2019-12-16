"use strict";

const Joi = require("@hapi/joi");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const { user } = require(join(BASE_DIR, "urlconf", "sideBar"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));
const { checkAppIsActive, getAppMessageContent } = require(join(MODEL_DIR, "user/Model_App_Details"));

exports.appDetailsView = (req, res, next) => {
	checkAppIsActive(req.query.appId, req.user._id)
		.then(({ success, info }) => {
			if (success) {
				return res.render("user/base-template", {
					layout: "app-details",
					info: companyInfo,
					title: `App Details - ${info.app_name}`,
					userName: req.user.name,
					email: req.user.email,
					sidebar: user,
					path: "/user/app-list",
					csrfToken: req.csrfToken(),
					appId: req.query.appId,
					appDetailUrl: req.path,
					updateContentUrl: web.updateContentUpload.url,
					userProfileSettingURL: web.userProfileSetting.url,
					ussd: `${req.protocol}://${req.hostname}/api/${info.app_serial}/${info.app_name}/ussd`,
					sms: `${req.protocol}://${req.hostname}/api/${info.app_serial}/${info.app_name}/sms`
				});
			} else {
				req.flash("appListPageMessage", "App not found.");
				return res.redirect(web.appList.url);
			}
		})
		.catch(err => next(err));
};

exports.getAppMessageContent = (req, res, next) => {
	getAppMessageContent(req.query, req.user._id)
		.then(result => {
			let response = [];
			!!result.list.content &&
				result.list.content.map(item => {
					response.push([
						item.date,
						item.time,
						item.message.substring(0, 80),
						!!item.send ? "Send" : "Panding",
						`<a href="javascript:void(0)" title="Edit Message" class="btn btn-info btn-icon" type="button" data-toggle="modal" data-target="#updateAppMessage" onclick="updateAppMessage('${item.date}','${item.time}','${req.params.appName}')" data-backdrop="static">
							<i class="far fa-edit"></i>
						</a>`
					]);
				});

			return res.json({
				data: response,
				recordsTotal: result.recordsTotal,
				recordsFiltered: result.recordsTotal
			});
		})
		.catch(err => next(err));
};

exports.getContent = (req, res, next) => {
	const schema = Joi.object({
		date: Joi.string()
			.trim()
			.pattern(/^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]$/)
			.required()
			.label("Date"),
		time: Joi.string()
			.trim()
			.pattern(/^[0-1][0-9]:00 (am|pm)$/)
			.required()
			.label("Time"),
		appName: Joi.string()
			.trim()
			.required()
			.label("App name")
	});

	const validateResult = schema.validate({
		date: req.query.date,
		time: req.query.time,
		appName: req.query.appName
	});

	if (validateResult.error) {
		return res.status(200).json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	const app = new model("app");
	app.findOne(
		{
			user_id: req.user._id,
			app_name: validateResult.value.appName
		},
		{
			_id: 0,
			content: {
				$elemMatch: {
					date: validateResult.value.date,
					time: validateResult.value.time
				}
			}
		}
	)
		.then(result => {
			if (result.length === 0) {
				return res.json({
					success: false,
					message: "App not found."
				});
			}

			return res.json({
				success: true,
				message: result.content[0].message
			});
		})
		.catch(err => next(err));
};

exports.updateContent = (req, res, next) => {
	const schema = Joi.object({
		date: Joi.string()
			.trim()
			.pattern(/^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]$/)
			.required()
			.label("Date"),
		time: Joi.string()
			.trim()
			.pattern(/^[0-1][0-9]:00 (am|pm)$/)
			.required()
			.label("Time"),
		appName: Joi.string()
			.trim()
			.required()
			.label("App name"),
		message: Joi.string()
			.trim()
			.required()
			.label("Message")
	});

	const validateResult = schema.validate({
		date: req.body.date,
		time: req.body.time,
		appName: req.body.appName,
		message: req.body.message
	});

	if (validateResult.error) {
		return res.status(200).json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	const app = new model("app");
	app.updateOne(
		{
			user_id: req.user._id,
			app_name: validateResult.value.appName,
			"content.date": validateResult.value.date,
			"content.time": validateResult.value.time
		},
		{
			"content.$.message": validateResult.value.message
		}
	)
		.then(updateInfo => {
			if (!updateInfo.result.nModified) {
				return res.json({
					success: false,
					message: "Server Error. Please try again later."
				});
			}

			return res.json({
				success: true,
				message: "successfully updated."
			});
		})
		.catch(err => next(err));
};
