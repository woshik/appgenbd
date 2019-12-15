"use strict";

const Joi = require("@hapi/joi");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const { format } = require("date-and-time");
const { user } = require(join(BASE_DIR, "urlconf", "sideBar"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));
const { passwordChange } = require(join(MODEL_DIR, "user/Model_Dashboard"));

exports.dashboardView = (req, res, next) => {
	res.render("user/base-template", {
		layout: "dashboard",
		info: companyInfo,
		title: "Dashboard",
		path: req.path,
		sidebar: user,
		csrfToken: req.csrfToken(),
		userName: req.user.name,
		email: req.user.email,
		isAccountLimitAvailable: req.user.is_account_limit_available,
		trialVersion: req.user.trial,
		accountActivationStartDate: format(new Date(req.user.account_activation_start_date), "DD-MM-YYYY"),
		accountActivationEndDate: format(new Date(req.user.account_activation_end_date), "DD-MM-YYYY"),
		maxAppCanInstall: req.user.max_app_can_install || 0,
		appInstalled: req.user.app_installed || 0,
		totalSubscribers: req.user.total_subscribers || 0,
		userProfileSettingURL: web.userProfileSetting.url
	});
};

exports.userLogout = (req, res) => {
	req.logout();
	req.flash("userLoginPageMessage", "Successfully Logout");
	res.redirect(web.userLogin.url);
};

exports.userProfileSetting = (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string()
			.trim()
			.pattern(/^[a-zA-Z\s]+$/)
			.required()
			.label("Name"),
		current_password: Joi.string()
			.trim()
			.min(5)
			.max(50)
			.required()
			.label("Current password"),
		new_password: Joi.string()
			.trim()
			.min(5)
			.max(50)
			.required()
			.label("New password"),
		confirm_password: Joi.ref("new_password")
	});

	const validateResult = schema.validate({
		name: req.body.username,
		current_password: req.body.current_password,
		new_password: req.body.new_password,
		confirm_password: req.body.confirm_password
	});

	if (validateResult.error) {
		return res.json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	passwordChange(validateResult.value, req.user._id)
		.then(data => res.json(data))
		.catch(err => next(err));
};
