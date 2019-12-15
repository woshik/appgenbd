"use strict";

const Joi = require("@hapi/joi");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const { user } = require(join(BASE_DIR, "urlconf", "sideBar"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));
const { insertAppName, installApp } = require(join(MODEL_DIR, "user/Model_Install_App"));
const entities = new (require("html-entities").AllHtmlEntities)();
const networkInterfaces = require("os").networkInterfaces();

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
		installAppFormURL: web.appName.url,
		userProfileSettingURL: web.userProfileSetting.url,
		hostAddress: networkInterfaces.eth0 ? networkInterfaces.eth0[0].address : "127.0.0.1"
	});
};

exports.appName = (req, res, next) => {
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
	} else if (!!req.user.max_app_can_install && !!req.user.app_installed && req.user.max_app_can_install === req.user.app_installed) {
		return res.json({
			success: false,
			message: `Your already installed ${req.user.app_installed} app.`
		});
	}

	insertAppName(validateResult.value.appName, req.user._id)
		.then(({ success, info }) => {
			if (success) {
				console.log(info);
				return res.json({
					success: success,
					info: {
						ussd: `${req.protocol}://${req.hostname}/api/${info.serial}/${info.name}/ussd`,
						sms: `${req.protocol}://${req.hostname}/api/${info.serial}/${info.name}/sms`,
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
		appName: Joi.string()
			.trim()
			.uppercase()
			.pattern(/^[a-zA-Z0-9_-\s]+$/)
			.required()
			.label("App Name"),
		appId: Joi.string()
			.trim()
			.label("App Id"),
		password: Joi.string()
			.trim()
			.label("Password")
	});

	const validateResult = schema.validate({
		appName: req.body.appName,
		appId: entities.encode(req.body.appId),
		password: entities.encode(req.body.appPassword)
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
	} else if (!!req.user.max_app_can_install && !!req.user.app_installed && req.user.max_app_can_install === req.user.app_installed) {
		return res.json({
			success: false,
			message: `Your already installed ${req.user.app_installed} app.`
		});
	}

	installApp(validateResult.value, req.user._id)
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
