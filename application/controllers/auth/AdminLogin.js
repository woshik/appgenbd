"use strict";

const passport = require("passport");
const Joi = require("@hapi/joi");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));

exports.adminLoginView = (req, res) => {
	res.render("auth/base-template", {
		layout: "admin-login",
		info: companyInfo,
		title: "Admin Login",
		csrfToken: req.csrfToken(),
		flashMessage: req.flash("adminLoginPageMessage"),
		loginFormURL: web.adminLogin.url
	});
};

exports.adminLogin = (req, res, next) => {
	const schema = Joi.object({
		email: Joi.string()
			.trim()
			.email()
			.required()
			.label("Email address"),
		password: Joi.string()
			.trim()
			.min(5)
			.max(50)
			.label("Password")
	});

	const validateResult = schema.validate({
		email: req.body.email,
		password: req.body.password
	});

	if (validateResult.error) {
		return res.json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	passport.authenticate("admin", function(err, user, info) {
		if (err) {
			return next(err);
		} else if (!user) {
			return res.json({
				success: false,
				message: info.message
			});
		} else {
			req.login(user, err => {
				if (!!err) {
					return next(err);
				} else {
					return res.json({
						success: true,
						message: web.adminDashboard.url
					});
				}
			});
		}
	})(req, res, next);
};
