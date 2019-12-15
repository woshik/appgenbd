"use strict";

const Joi = require("@hapi/joi");
const { getSettingData, appSetting } = require(join(MODEL_DIR, "admin/Model_Application_Setting"));
const { fromErrorMessage } = require(join(BASE_DIR, "core", "util"));

exports.getApplicationSettingData = (req, res, next) =>
	getSettingData()
		.then(data => res.json(data))
		.catch(err => next(err));

exports.appSetting = (req, res, next) => {
	const schema = Joi.object({
		maxAppCanInstall: Joi.number()
			.min(15)
			.required()
			.label("Max app"),
		costPerMonth: Joi.number()
			.min(350)
			.required()
			.label("Cost per month")
	});

	const validateResult = schema.validate({
		maxAppCanInstall: req.body.maxAppCanInstall,
		costPerMonth: req.body.costPerMonth
	});

	if (validateResult.error) {
		return res.json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	appSetting(validateResult.value)
		.then(({ success, info }) =>
			res.json({
				success: true,
				message: "Application setting successfully updated."
			})
		)
		.catch(err => next(err));
};
