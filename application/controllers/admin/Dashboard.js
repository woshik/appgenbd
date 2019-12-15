"use strict";

const Joi = require("@hapi/joi");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));
const { admin } = require(join(BASE_DIR, "urlconf", "sideBar"));
const { profileSetting } = require(join(MODEL_DIR, "admin/Model_Dashboard"));

exports.dashboardView = (req, res, next) => {
	res.render("admin/base-template", {
		layout: "dashboard",
		info: companyInfo,
		title: "Admin",
		path: req.path,
		sidebar: admin,
		email: req.user.email,
		csrfToken: req.csrfToken()
	});
};

exports.adminLogout = (req, res) => {
	req.logout();
	req.flash("adminLoginPageMessage", "Successfully Logout");
	res.redirect(web.adminLogin.url);
};

exports.profileSetting = (req, res, next) => {
	const schema = Joi.object({
		email: Joi.string()
			.trim()
			.email()
			.required()
			.label("Email address"),
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
			.label("Password"),
		confirm_password: Joi.ref("new_password")
	});

	const validateResult = schema.validate({
		email: req.body.adminEmail,
		current_password: req.body.adminPassword,
		new_password: req.body.adminNewPassword,
		confirm_password: req.body.adminConfirmPassword
	});

	if (validateResult.error) {
		return res.json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	profileSetting(validateResult.value, req.user._id)
		.then(({ success, message }) =>
			res.json({
				success: success,
				message: message
			})
		)
		.catch(err => next(err));
};
