const { join } = require("path")
const Joi = require("@hapi/joi")
const bcrypt = require("bcryptjs")
const crypto = require('crypto')
const { commonInfo, fromErrorMessage, sendMail, hashPassword } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))
const model = require(join(__dirname, "../../", "db", "model"))

const forgotPasswordView = (req, res) => {
    res.render("auth/forgotPassword", {
        info: commonInfo,
        title: "Forgot Password",
        csrfToken: req.csrfToken(),
        forgotPasswordForm: web.forgotPassword.url,
        loginPage: web.userLogin.url
    })
}

const forgotPassword = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().required().label("Email address"),
    })

    const validateResult = schema.validate({
        email: req.body.email,
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    const user = new model("users")

    user.findOne({ email: validateResult.value.email })
        .then(isEmailRegister => {
            if (!isEmailRegister) {
                return res.status(200).json({
                    success: false,
                    message: "Email address not found"
                })
            }

            let tokenTime = new Date()
            tokenTime.setMinutes(tokenTime.getMinutes() + 10)
            let token = Math.floor(Math.random() * 100001)
            let userRDId = crypto.randomBytes(30).toString('hex')

            user.updateOne({ email: isEmailRegister.email }, {
                    'forgot': 1,
                    'token': token,
                    'forgot_token_time': tokenTime,
                    'userRDId': userRDId
                })
                .then(result => {
                    sendMail(isEmailRegister.email, "Varification Code", token)
                        .then((response) => {})
                        .catch(err => next(err))

                    req.flash('emailSend', 'Please check your email account.')
                    return res.status(200).json({
                        success: true,
                        message: web.forgotPasswordCodeVerify.url.replace(":id", userRDId)
                    })
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

const forgotPasswordCodeVerifyView = (req, res, next) => {

    const user = new model("users")
    user.findOne({ userRDId: req.params.id })
        .then(userData => {

            if (!userData || userData.email_active !== 1) {
                req.flash('userLoginScreenErrorMessage', 'User account not found')
                return res.redirect(web.userLogin.url)
            }

            if (userData.forgot !== 1) {
                req.flash('userLoginScreenErrorMessage', 'User account not active')
                return res.redirect(web.forgotPassword.url)
            }

            res.render("auth/emailCheck", {
                info: commonInfo,
                title: "Email Verification",
                csrfToken: req.csrfToken(),
                verificationForm: web.forgotPasswordCodeVerify.url.replace(":id", req.params.id),
                sendEmail: web.sendEmailAgain.url.replace(":id", req.params.id),
                loginPage: web.userLogin.url,
                flashMessage: req.flash('emailSend')
            })
        })
        .catch(err => next(err))
}

const forgotPasswordCodeVerify = (req, res, next) => {

    const schema = Joi.object({
        code: Joi.string().trim().required().label("Verification code")
    })

    const validateResult = schema.validate({
        code: req.body.code
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    const user = new model("users")
    user.findOne({ userRDId: req.params.id })
        .then(userData => {

            if (!userData || userData.email_active !== 1) {
                req.flash('userLoginScreenErrorMessage', 'User account not found')
                return res.redirect(web.userLogin.url)
            }

            if (userData.forgot !== 1) {
                req.flash('userLoginScreenErrorMessage', 'User account not active')
                return res.redirect(web.forgotPassword.url)
            }

            if (userData.forgot_token_time.getTime() > new Date().getTime()) {
                if (userData.token !== parseInt(validateResult.value.code)) {
                    return res.status(200).json({
                        success: false,
                        message: "Please enter valid verification code"
                    })
                }

                let userRDId = crypto.randomBytes(30).toString('hex')
                user.updateOne({ userRDId: req.params.id }, { "userRDId": userRDId })
                    .then(userUpdateValue => {
                        return res.status(200).json({
                            success: true,
                            message: web.passwordChange.url.replace(":id", userRDId).replace(":code", validateResult.value.code)
                        })
                    })
                    .catch(err => next(err))

            } else {

                let tokenTime = new Date()
                tokenTime.setMinutes(tokenTime.getMinutes() + 10)
                let token = Math.floor(Math.random() * 100001)

                sendMail(userData.email, "Varification Code", token)
                    .then(response => {})
                    .catch(err => next(err))

                user.updateOne({ userRDId: req.params.id }, {
                        "token": token,
                        "forgot_token_time": tokenTime
                    })
                    .then(userUpdateValue => {
                        return res.status(200).json({
                            success: false,
                            message: "Please, check your email account again. Verification code time finish."
                        })
                    })
                    .catch(err => next(err))
            }
        })
        .catch(err => next(err))
}

const changePasswordView = (req, res, nex) => {
    const user = new model("users");
    user.findOne({ userRDId: req.params.id, token: req.params.code })
        .then(userData => {
            if (!userData || userData.forget !== 1 || userData.email_active !== 1 || userData.forgot !== 1) {
                req.flash('userLoginScreenErrorMessage', 'The link you used is invalid. Please try again.')
                return res.redirect(web.userLogin)
            }

            res.render("auth/changePassword", {
                info: commonInfo,
                title: "Change Password",
                csrfToken: req.csrfToken(),
                changePasswordForm: web.passwordChange.url.replace(":id", userData.userRDId).replace(":code", userData.token)
            });
        })
        .catch(err => next(err))
}

const changePassword = (req, res, next) => {

    const schema = Joi.object({
        password: Joi.string().trim().min(5).max(50).label("Password"),
        confirm_password: Joi.ref("password")
    })

    const validateResult = schema.validate({
        password: req.body.password,
        confirm_password: req.body.confirm_password
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    const user = new model("users");

    user.findOne({ userRDId: req.params.id, token: req.params.code, forgot: 1 })
        .then(userAvailable => {
            if (!userAvailable) {
                return res.status(200).json({
                    success: true,
                    message: "User not found"
                })
            }

            hashPassword(validateResult.value.password)
                .then(passwordHashed => {

                    let password = {
                        'password': passwordHashed,
                        'forget': 0
                    }

                    user.updateOne({ _id: userAvailable._id }, password)
                        .then(userUpdateValue => {
                            req.flash('userLoginScreenSuccessMessage', 'Password Successfully Changed')
                            return res.status(200).json({
                                success: true,
                                message: web.userLogin
                            })
                        })
                        .catch(err => next(err))
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

module.exports = {
    forgotPasswordView,
    forgotPassword,
    forgotPasswordCodeVerifyView,
    forgotPasswordCodeVerify,
    changePasswordView,
    changePassword
}