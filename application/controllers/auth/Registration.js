"use strict";

const Joi = require("@hapi/joi");
const web = require(join(BASE_DIR, "urlconf/webRule"));
const { registration } = require(join(MODEL_DIR, "auth/Model_Registration"));
const { sendMail, companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core/util"));

exports.registrationView = (req, res) => {
	res.render("auth/base-template", {
		layout: "registration",
		info: companyInfo,
		title: "User Registration",
		csrfToken: req.csrfToken(),
		registrationFormURL: web.registration.url,
		loginPageURL: web.userLogin.url
	});
};

exports.registration = (req, res, next) => {
	req.body.mobile_number = `+880${req.body.mobile_number}`;

	const schema = Joi.object({
		name: Joi.string()
			.trim()
			.pattern(/^[a-zA-Z\s]+$/)
			.required()
			.label("Name"),
		mobile_number: Joi.string()
			.trim()
			.pattern(/^(\+880)[0-9]{10}$/)
			.required()
			.label("Mobile number"),
		email: Joi.string()
			.trim()
			.lowercase()
			.email()
			.required()
			.label("Email address"),
		password: Joi.string()
			.trim()
			.min(5)
			.max(50)
			.label("Password"),
		confirm_password: Joi.ref("password")
	});

	const validateResult = schema.validate({
		name: req.body.name,
		mobile_number: req.body.mobile_number,
		email: req.body.email,
		password: req.body.password,
		confirm_password: req.body.confirm_password
	});

	if (validateResult.error) {
		return res.json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	registration(validateResult.value)
		.then(({ success, info }) => {
			if (success) {
				sendMail(info.email, "Varification Code", info.token).catch(err => console.log(err));
				req.flash("accountActivationPageMessage", "Please, check your email account.");

				return res.json({
					success: true,
					url: `${web.accountActivation.url}?email=${encodeURIComponent(info.email)}&rd=${info.rd}`
				});
			} else {
				return res.json({
					success: false,
					message: info
				});
			}
		})
		.catch(err => next(err));
};
