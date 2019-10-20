const { join } = require("path")
const Joi = require("@hapi/joi")
const crypto = require('crypto')
const { commonInfo, fromErrorMessage, hashPassword, sendMail } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))
const model = require(join(__dirname, "../../", "db", "model"));

const registrationView = (req, res) => {
    res.render("auth/registration", {
        info: commonInfo,
        title: "Account Registration",
        csrfToken: req.csrfToken(),
        registrationForm: web.registration.url,
        loginPage: web.userLogin.url
    });
};

const registration = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().trim().pattern(/^[a-zA-Z\s]+$/).required().label("Name"),
        number: Joi.string().trim().pattern(/^(01|\+8801)[0-9]{9,14}/).required().label("Mobile number"),
        email: Joi.string().trim().email().required().label("Email address"),
        password: Joi.string().trim().min(5).max(50).label("Password"),
        confirm_password: Joi.ref("password")
    });

    const validateResult = schema.validate({
        name: req.body.name,
        number: req.body.number,
        email: req.body.email,
        password: req.body.password,
        confirm_password: req.body.confirm_password
    });

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        });
    }

    const user = new model("users");

    user.findOne({ email: validateResult.value.email })
        .then(isEmailRegister => {
            if (isEmailRegister) {
                return res.status(200).json({
                    success: false,
                    message: "Email address already registered"
                });
            }

            hashPassword(validateResult.value.password)
                .then(passwordHashed => {
                    let time = new Date()

                    user.save({
                            userRDId: crypto.randomBytes(30).toString('hex'),
                            name: validateResult.value.name,
                            number: validateResult.value.number,
                            email: validateResult.value.email,
                            password: passwordHashed,
                            email_verify: 0,
                            token: Math.floor(Math.random() * 100001),
                            token_refresh: time.setMinutes(time.getMinutes() + 10),
                            max_app_install: 0,
                            app_installed: 0,
                            account_activation_end: new Date().toDateString(),
                            mail_for_verification: 1,
                            account_create: new Date().toString(),
                        })
                        .then(dataInsectionResult => {
                            sendMail(dataInsectionResult.ops[0].email, "Varification Code", dataInsectionResult.ops[0].token)
                                .then(response => {})
                                .catch(err => res.next(err))

                            req.flash('emailSend', 'Please, check your email account.')

                            return res.status(200).json({
                                success: true,
                                message: web.emailVerification.url.replace(":id", dataInsectionResult.ops[0].userRDId)
                            });
                        })
                        .catch(err => next(err))
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
};

const sendMailAgain = (req, res, next) => {

    const user = new model("users");
    user.findOne({ userRDId: req.params.id })
        .then(userData => {
            if (!userData) {
                req.flash('userLoginScreenErrorMessage', 'User account not found')
                return res.status(200).json({
                    url: web.userLogin.url
                })
            }

            if (userData.mail_for_verification >= 5) {
                return res.status(200).json({
                    message: 'You already send email too many time. Please wait for a while.'
                });
            }

            if (userData.token_refresh > new Date().getTime()) {

                sendMail(userData.email, "Varification Code", userData.token)
                    .then(response => {})
                    .catch(err => res.next(err))

                user.customUpdateOne({ userRDId: req.params.id }, { '$inc': { "mail_for_verification": 1 } })
                    .then(userUpdateValue => {
                        if (!userUpdateValue.result.nModified) {
                            return res.status(200).json({
                                message: 'Server Error. Please try again later.'
                            })
                        }

                        return res.status(200).json({
                            message: 'Please, check your email address again.'
                        })
                    })
                    .catch(err => next(err))
            } else {
                let tokenTime = new Date();

                let updateValue = {
                    "$set": {
                        "token": Math.floor(Math.random() * 100001),
                        "token_refresh": tokenTime.setMinutes(tokenTime.getMinutes() + 10)
                    },
                    "$inc": {
                        "mail_for_verification": 1
                    }
                };

                sendMail(userData.email, "Varification Code", updateValue.token)
                    .then(response => {})
                    .catch(err => res.next(err))

                user.customUpdateOne({ userRDId: req.params.id }, updateValue)
                    .then(userUpdateValue => {

                        if (!userUpdateValue.result.nModified) {
                            return res.status(200).json({
                                message: 'Server Error. Please try again later.'
                            })
                        }
                        
                        return res.status(200).json({
                            message: "Please, check again your email address."
                        });
                    })
                    .catch(err => next(err))
            }
        })
        .catch(err => next(err))
}

module.exports = {
    registrationView,
    registration,
    sendMailAgain
};