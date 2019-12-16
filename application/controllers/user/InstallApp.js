"use strict";

const Joi = require("@hapi/joi");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const networkInterfaces = require("os").networkInterfaces();
const { user } = require(join(BASE_DIR, "urlconf", "sideBar"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));
const { insertAppName, installApp } = require(join(MODEL_DIR, "user/Model_Install_App"));
const { getDB } = require(join(BASE_DIR, "db", "database"));

exports.installAppView = (req, res, next) => {
	res.render("user/base-template", {
		layout: "install-app",
		info: companyInfo,
		title: "Install App",
		path: req.path,
		sidebar: user,
		csrfToken: req.csrfToken(),
		userName: req.user.name,
		email: req.user.email,
		hostAddress: networkInterfaces.eth0 ? networkInterfaces.eth0[0].address : "127.0.0.1",
		installAppFormURL: web.appName.url,
		userProfileSettingURL: web.userProfileSetting.url
	});
};

exports.appName = async (req, res, next) => {
	const schema = Joi.object({
		appName: Joi.string()
			.trim()
			.pattern(/^[a-zA-Z0-9_-\s]+$/)
			.required()
			.label("App Name")
	});

	const validateResult = schema.validate({
		appName: req.body.appName
	});

	if (validateResult.error) {
		return res.json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	} else if (!!req.user.trial) {
		return res.json({
			success: false,
			message: "Please, active your account. Your are now using trial version."
		});
	}

	try {
		if (
			req.user.max_app_can_install ===
			(await getDB()
				.collection("app")
				.countDocuments({ user_id: req.user._id }))
		) {
			return res.json({
				success: false,
				message: `Your already installed ${req.user.app_installed} app.`
			});
		}
	} catch (error) {
		return next(error);
	}

	insertAppName(validateResult.value.appName, req.user._id)
		.then(({ success, info }) => {
			if (success) {
				return res.json({
					success: success,
					info: {
						id: info.id,
						ussd: `${req.protocol}://${req.hostname}/api/${info.serial}/${validateResult.value.appName}/ussd`,
						sms: `${req.protocol}://${req.hostname}/api/${info.serial}/${validateResult.value.appName}/sms`,
						url: web.installApp.url
					}
				});
			} else {
				return res.json({
					success: success,
					message: info
				});
			}
		})
		.catch(err => next(err));
};

exports.installApp = (req, res, next) => {
	const schema = Joi.object({
		appId: Joi.string()
			.required()
			.trim()
			.pattern(/^[a-zA-Z0-9_-\s]+$/)
			.uppercase()
			.label("App Id"),
		password: Joi.string()
			.required()
			.trim()
			.label("Password")
	});

	const validateResult = schema.validate({
		appId: req.body.appId,
		password: req.body.appPassword
	});

	if (validateResult.error) {
		return res.json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	installApp(validateResult.value, req.body.id, req.user._id)
		.then(({ success, info }) => {
			if (success) {
				return res.json({
					success: success,
					info: {
						message: "Your app is successfully installed",
						url: web.appName.url
					}
				});
			} else {
				return res.json({
					success: success,
					message: info
				});
			}
		})
		.catch(err => next(err));
};
