const { join } = require("path")
const Joi = require('@hapi/joi')
const crypto = require('crypto')
const { commonInfo, fromErrorMessage } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))
const sidebar = require(join(__dirname, "../../", "urlconf", "sideBar"))
const model = require(join(__dirname, "../../", "db", "model"))

const appInstallView = (req, res, next) => {
    res.render("user/installApp", {
        info: commonInfo,
        title: 'Install App',
        userName: req.user.name,
        email: req.user.email,
        sidebar: sidebar,
        path: req.path,
        csrfToken: req.csrfToken(),
        installAppForm: web.appName.url,
    });
};

const appName = (req, res, next) => {
    const schema = Joi.object({
        appName: Joi.string().trim().pattern(/^[a-zA-Z0-9\s]+$/).required().label("App Name"),
    })

    const validateResult = schema.validate({
        appName: req.body.appName,
    });

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    if (req.user.max_app_install === req.user.app_install) {
        return res.status(200).json({
            success: false,
            message: `Your already install ${req.user.app_install} app`
        })
    }

    const app = new model("app")

    app.findOne({ app_name: validateResult.value.appName })
        .then(userData => {
            if (userData) {
                return res.status(200).json({
                    success: false,
                    message: `This app name already exist.`
                });
            }

            let randomSerial = crypto.randomBytes(20).toString('hex')

            app.save({
                    user_id: req.user._id,
                    app_name: validateResult.value.appName,
                    subscribe: 0,
                    dial: 0,
                    randomSerial: randomSerial,
                    createDate: new Date(),
                })
                .then(dataInsectionResult => {
                    const user = new model("users")

                    user.customUpdateOne({ _id: req.user._id }, {
                            "$inc": {
                                "app_install": 1
                            }
                        })
                        .then(userData => {
                            if (!userData.result.nModified) {
                                return res.status(200).json({
                                    success: false,
                                    message: 'Server error. Try again later.'
                                })
                            }

                            let response = {
                                'ussd': `${req.protocol}://${req.hostname}/api/${randomSerial}/${validateResult.value.appName}/ussd`,
                                'sms': `${req.protocol}://${req.hostname}/api/${randomSerial}/${validateResult.value.appName}/sms`,
                                'url': web.appInstall.url,
                            }

                            return res.status(200).json({
                                success: true,
                                message: response
                            })
                        })
                        .catch(err => next(err))
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
};

const appInstall = (req, res, next) => {
    const schema = Joi.object({
        appName: Joi.string().trim().required().label("App Name"),
        appId: Joi.string().trim().label("App Id"),
        password: Joi.string().trim().label("Password"),
    });

    const validateResult = schema.validate({
        appName: req.body.appName,
        appId: req.body.appId,
        password: req.body.appPassword
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        });
    }

    if (req.user.max_app_install === req.user.app_install) {
        return res.status(200).json({
            success: false,
            message: `Your already install ${req.user.app_install} app`
        });
    }

    const app = new model("app");

    app.updateOne({ userId: req.user._id, app_name: validateResult.value.appName }, {
            'app_id': validateResult.value.appId,
            'password': validateResult.value.password
        })
        .then(updateData => {
            if (!updateData.result.nModified) {
                return res.status(200).json({
                    success: false,
                    message: 'Please, first install app name'
                })

            }
            return res.status(200).json({
                success: true,
                message: {
                    msg: 'Your app is successfully installed',
                    url: web.appName.url
                }
            })
        })
        .catch(err => next(err))
}

module.exports = {
    appInstallView,
    appInstall,
    appName,
}