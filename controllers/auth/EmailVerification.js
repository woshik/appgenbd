const { join } = require("path")
const Joi = require("@hapi/joi")
const crypto = require('crypto')
const { commonInfo, fromErrorMessage, sendMail } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))
const model = require(join(__dirname, "../../", "db", "model"));

exports.emailVerificationView = (req, res, next) => {

    const user = new model("users");
    user.findOne({ userRDId: req.params.id })
        .then(userData => {
            if (!userData) {
                req.flash('userLoginScreenErrorMessage', 'User account not found')
                return res.redirect(web.userLogin.url)
            }

            if (userData.email_verify) {
                req.flash('userLoginScreenErrorMessage', 'Your account already activated')
                return res.redirect(web.userLogin.url)
            }

            res.render("auth/emailCheck", {
                info: commonInfo,
                title: "Email Verification",
                csrfToken: req.csrfToken(),
                verificationForm: web.emailVerification.url.replace(":id", req.params.id),
                sendEmail: web.sendEmailAgain.url.replace(":id", req.params.id),
                flashMessage: req.flash('emailSend'),
                loginPage: web.userLogin.url
            })
        })
        .catch(err => next(err))
}

exports.emailVerification = (req, res, next) => {
    const schema = Joi.object({
        code: Joi.string().trim().required().label("Verification code")
    });

    const validateResult = schema.validate({
        code: req.body.code
    });

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        });
    }

    const user = new model("users");
    user.findOne({ userRDId: req.params.id })
        .then(userData => {

            if (!userData) {
                req.flash('userLoginScreenErrorMessage', 'User account not found')
                return res.status(200).json({
                    success: true,
                    message: web.userLogin.url
                })
            }

            if (userData.email_verify) {
                req.flash('userLoginScreenErrorMessage', 'Your account already activated')
                return res.status(200).json({
                    success: true,
                    message: web.userLogin.url
                });
            }

            if (userData.token_refresh > new Date().getTime()) {
                if (userData.token !== parseInt(validateResult.value.code)) {
                    return res.status(200).json({
                        success: false,
                        message: "Please enter valid verification code"
                    });
                }

                user.updateOne({ userRDId: req.params.id }, { "email_verify": true, "userRDId": crypto.randomBytes(30).toString('hex') })
                    .then(userUpdateValue => {
                        if (!userUpdateValue.result.nModified) {
                            return res.status(200).json({
                                success: false,
                                message: 'Server Error. Please try again later.'
                            })
                        }

                        req.flash('userLoginScreenSuccessMessage', 'Account successfully active.')

                        return res.status(200).json({
                            success: true,
                            message: web.userLogin.url
                        });
                    })
                    .catch(err => next(err))
            } else {
                let tokenTime = new Date();

                let token = Math.floor(Math.random() * 100001)

                sendMail(userData.email, "Varification Code", token)
                    .then(response => {})
                    .catch(err => res.next(err))

                user.customUpdateOne({ userRDId: req.params.id }, {
                        "$set": {
                            "token": token,
                            "token_refresh": tokenTime.setMinutes(tokenTime.getMinutes() + 10)
                        },
                        "$inc": {
                            "mail_for_verification": 1
                        }
                    })
                    .then(userUpdateValue => {

                        if (!userUpdateValue.result.nModified) {
                            return res.status(200).json({
                                success: false,
                                message: 'Server Error. Please try again later.'
                            })
                        }

                        return res.status(200).json({
                            success: false,
                            message: "Please, check your email account again. Code time finish."
                        });
                    })
                    .catch(err => next(err))
            }
        })
        .catch(err => next(err))
}