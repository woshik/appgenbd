const path = require("path");
const Joi = require('@hapi/joi');
const randomstring = require("randomstring");
const ObjectId = require("mongodb").ObjectID;

const UTIL_FOLDER = path.join(__dirname, "../../../", "util");

const { web } = require(path.join(UTIL_FOLDER, "urls"));
const commonInfo = require(path.join(UTIL_FOLDER, "commonInfo.js"));
const { FromError } = require(path.join(UTIL_FOLDER, "errorMessage"));
const sidebar = require(path.join(UTIL_FOLDER, "sideBar"));

const model = require(path.join(__dirname, "../../", "models", "model"));

const applicationGeneratorView = (req, res, next) => {
	res.render("user/applicationGenerator", {
	    info: commonInfo,
	    title: 'Application Generator',
	    userName: req.user.name,
	    email: req.user.email,
	    active: req.user.account_active,
	    sidebar: sidebar,
	    path: req.path,
	    csrfToken: req.csrfToken(),
	    installAppForm: web.appName,
	});
};

const applicationGenerator = (req, res, next) => {
	const schema = Joi.object({
        appId: Joi.string().trim().pattern(/^[a-zA-Z0-9]+$/).required().label("App Name"),
        messageDate: Joi.string().trim().pattern(/^[0-9-]+$/).required().label("Message Receiving Date"),
        content: Joi.string().trim().required().label("Message")
    })

    const validateResult = schema.validate({
        appId: req.body.appId,
        messageDate: req.body.messageDate,
        content: req.body.messageContent
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: FromError(validateResult.error.details[0])
        });
    }
};

module.exports = {
	applicationGeneratorView,
	applicationGenerator
}