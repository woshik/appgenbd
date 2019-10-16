const { join } = require("path")
const passport = require("passport")
const Joi = require("@hapi/joi")
const { commonInfo, fromErrorMessage } = require(join(__dirname, "../../", "core", "util"))
const { web } = require(join(__dirname, "../../", "urlconf", "rules"))

const userLoginView = (req, res) => {
    res.render("auth/userLogin", {
        info: commonInfo,
        title: "User Login",
        csrfToken: req.csrfToken(),
        userloginForm: web.userLogin.url,
        forgotPassword: web.forgotPassword.url,
        registrationPage: web.registration.url,
        successMessage: req.flash('userLoginScreenSuccessMessage'),
        errorMessage: req.flash('userLoginScreenErrorMessage')
    })
}

const userLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().required().label("Email address"),
        password: Joi.string().trim().min(5).max(50).label("Password")
    })

    const validateResult = schema.validate({
        email: req.body.email,
        password: req.body.password
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err)
        if (!user) {
            return res.status(200).json({
                success: false,
                message: info.message
            })
        }

        req.login(user)
            .then(() => {
                return res.status(200).json({
                    success: true,
                    message: web.userDashboard.url
                })
            })
            .catch(err => next(err))
    })(req, res, next)
}

module.exports = {
    userLoginView,
    userLogin,
};