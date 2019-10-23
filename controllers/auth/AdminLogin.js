const { join } = require("path")
const passport = require("passport")
const Joi = require("@hapi/joi")
const { commonInfo, fromErrorMessage } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))

exports.adminLoginView = (req, res) => {
    res.render("auth/adminLogin", {
        info: commonInfo,
        title: "Admin Login",
        csrfToken: req.csrfToken(),
        loginForm: web.adminLogin.url,
        successMessage: req.flash('adminLoginScreenSuccessMessage'),
        errorMessage: req.flash('adminLoginScreenErrorMessage')
    })
}

exports.adminLogin = (req, res, next) => {
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

    passport.authenticate('admin', function(err, user, info) {
        if (err) return next(err)
        if (!user) {
            return res.status(200).json({
                success: false,
                message: info.message
            })
        }

        req.login(user, (err) => {
            if (!!err) next(err)
            return res.status(200).json({
                success: true,
                message: web.adminDashboard.url
            })
        })
    })(req, res, next)
}