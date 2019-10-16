const config = require('config');
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

const installAppView = (req, res, next) => {
	res.render("user/installApp", {
	    info: commonInfo,
	    title: 'Install App',
	    userName: req.user.name,
	    email: req.user.email,
	    active: req.user.account_active,
	    sidebar: sidebar,
	    path: req.path,
	    csrfToken: req.csrfToken(),
	    installAppForm: web.appName,
	});
};

const appName = (req, res, next) => {
 	const schema = Joi.object({
		appName: Joi.string().trim().pattern(/^[a-zA-Z0-9\s]+$/).required().label("App Name"),
	});

	const validateResult = schema.validate({
	    appName: req.body.appName,
	});

	if (validateResult.error) {
	    return res.status(200).json({
	    	success: false,
	    	message: FromError(validateResult.error.details[0])
	    });
	}

	if (req.user.max_app_install === req.user.app_install) {
		return res.status(200).json({
	    	success: false,
	    	message: `Your already install ${req.user.app_install} app`
	    });
	}

	const app = new model("app");
	const user = new model("users");

	let randomSerial = randomstring.generate({ length: 30, charset: 'alphabetic' });

	let install_app = req.user.app_install+1;
	app.findOne({app_name: validateResult.value.appName})
	.then(userData => {
		if (userData) {
			return res.status(200).json({
	    		success: false,
	    		message: `This app name already exist.`
	    	});
	    }

		app.save({
			userId: req.user._id,
	    	app_name: validateResult.value.appName,
	    	subscribe: 0,
	    	dial: 0,
	    	randomSerial: randomSerial,
	    	createDate: new Date(),
	    })
	    .then(dataInsectionResult => {
	        user.updateOne({ _id: req.user._id }, { "app_install": install_app })
	        .then(userData => {
	        	if (userData.result.nModified === 0) {
	        		return res.status(200).json({
				    	success: false,
				    	message: 'Try again leater'
				    });
				}    

	        	let response = { 
	        		'ussd': `${req.protocol}://${req.hostname}/api/${randomSerial}/${validateResult.value.appName}/ussd`,
	        		'sms': `${req.protocol}://${req.hostname}/api/${randomSerial}/${validateResult.value.appName}/sms`,
	        		'id': dataInsectionResult.ops[0]._id,
	        		'url': web.installApp,
	        	};

	        	return res.status(200).json({
			    	success: true,
			    	message: response
			    });

	        })
	        .catch(err => {
	        	return next(err);
	        })
	    })
	    .catch(err => {
	    	return next(err);
	    });
	})
	.catch(err => {
		return next(err);
	})
};

const installApp = (req, res, next) => {
	const schema = Joi.object({
		appName: Joi.string().trim().pattern(/^[a-zA-Z0-9\s]+$/).required().label("App Name"),
		appId: Joi.string().trim().label("App Id"),
	    password: Joi.string().trim().label("Password"),
	});

	const validateResult = schema.validate({
	    appName: req.body.appName,
	    appId: req.body.appId,
		password: req.body.appPassword
	});

	if (validateResult.error) {
	    return res.status(200).json({
	    	success: false,
	    	message: FromError(validateResult.error.details[0])
	    });
	}

	if (req.user.max_app_install === (req.user.app_install-1)) {
		return res.status(200).json({
	    	success: false,
	    	message: `Your already install ${req.user.app_install} app`
	    });
	}

	const app = new model("app");

	app.updateOne({ userId: req.user._id, app_name: validateResult.value.appName}, {'appId': validateResult.value.appId, 'password': validateResult.value.password})
	.then(updateData => {
		if (updateData.result.nModified) {
			return res.status(200).json({
		    	success: true,
		    	message: { 
		    		msg: 'Your app is successfully installed',
		    		url: web.appName
		    	}
		    });
		} else {
			return res.status(200).json({
		    	success: false,
		    	message: 'Please, first install app name'
		    });
		}
	})
	.catch(err => {
		next(err);
	})
	
}

module.exports = {
	installAppView,
	installApp,
	appName
}